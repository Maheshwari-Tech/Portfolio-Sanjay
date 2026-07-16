import os
from dataclasses import replace

os.environ.update({
    "APP_ENV": "development",
    "AUTH_PROVIDER": "local",
    "DATABASE_URL": "sqlite:////private/tmp/sanjay-portfolio-tests.db",
    "JWT_SECRET": "test-jwt-secret-that-is-longer-than-thirty-two-characters",
    "OTP_HASH_SECRET": "test-otp-secret-that-is-longer-than-thirty-two-characters",
    "ADMIN_PHONE": "+918847472124",
})

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

import main
from storage import challenge_table


client = TestClient(main.app)


@pytest.fixture(autouse=True)
def clean_state(monkeypatch):
    main.store.put_json("application", main.default_db())
    main.ensure_development_admin()
    with main.store.engine.begin() as connection:
        connection.execute(delete(challenge_table))
    monkeypatch.setattr(main, "settings", replace(main.settings, auth_provider="local"))


def create_user(phone: str, name: str):
    sent = client.post("/auth/request-otp", json={"phone": phone})
    assert sent.status_code == 200
    code = main.json.loads(main.LOCAL_OTP_OUTBOX.read_text())["code"]
    requires_name = client.post("/auth/verify-otp", json={"phone": phone, "code": code})
    if requires_name.status_code == 200:
        return requires_name.json()
    assert requires_name.status_code == 428
    verified = client.post("/auth/verify-otp", json={"phone": phone, "code": code, "name": name})
    assert verified.status_code == 200
    return verified.json()


def test_health_and_database_readiness():
    assert client.get("/health").json()["status"] == "ok"
    assert client.get("/ready").json() == {"status": "ready"}


def test_only_one_otp_is_active_until_expiry():
    first = client.post("/auth/request-otp", json={"phone": "9999999999"})
    second = client.post("/auth/request-otp", json={"phone": "9999999999"})
    assert first.status_code == 200
    assert "development_code" not in first.json()
    assert second.status_code == 200
    assert second.json()["already_active"] is True
    assert "development_code" not in second.json()


def test_member_signup_login_and_protected_workflows():
    auth = create_user("9999999999", "Test Member")
    headers = {"Authorization": f"Bearer {auth['token']}"}
    demo = client.post("/submissions", headers=headers, json={"type": "demo", "title": "Demo", "name": "Test Member", "project_id": "1"})
    assert demo.status_code == 200
    assert demo.json()["user_id"] == auth["user"]["id"]
    liked = client.post("/content/project-1/interactions", headers=headers, json={"action": "like"})
    assert liked.json() == {"liked": True, "count": 1}
    commented = client.post("/content/project-1/interactions", headers=headers, json={"action": "comment", "message": "Useful project"})
    assert commented.status_code == 200
    assert commented.json()["comment"]["author"] == "Test Member"
    assert client.get("/admin/overview", headers=headers).status_code == 403
    assert client.get("/member/candidates", headers=headers).status_code == 403
    assert client.get("/member/recruiters", headers=headers).status_code == 403


def test_public_forms_work_without_login_but_demo_does_not():
    contact = client.post("/submissions", json={"type": "contact", "title": "Hello", "name": "Visitor", "message": "Hi"})
    assert contact.status_code == 200
    assert contact.json()["status"] == "pending"
    demo = client.post("/submissions", json={"type": "demo", "title": "Demo", "name": "Visitor"})
    assert demo.status_code == 401


def test_admin_can_read_dashboard_and_create_content():
    before_otp = client.post("/auth/password", json={"phone": "8847472124", "password": "123456"})
    assert before_otp.status_code == 200
    auth = create_user("8847472124", "Sanjay")
    assert auth["user"]["role"] == "admin"
    after_otp = client.post("/auth/password", json={"phone": "8847472124", "password": "123456"})
    assert after_otp.status_code == 200
    headers = {"Authorization": f"Bearer {auth['token']}"}
    assert client.get("/member/candidates", headers=headers).status_code == 200
    assert client.get("/member/recruiters", headers=headers).status_code == 200
    client.post("/submissions", json={"type": "feedback", "title": "Feedback", "name": "Visitor", "message": "Looks good"})
    overview = client.get("/admin/overview", headers=headers)
    assert overview.status_code == 200
    assert overview.json()["counts"]["requests"] == 1
    created = client.post("/admin/content", headers=headers, json={"kind": "blog", "title": "Test Article", "description": "Test summary", "body": "Test body"})
    assert created.status_code == 200
    assert created.json()["title"] == "Test Article"


def test_admin_grants_database_backed_candidate_and_recruiter_access():
    member = create_user("9999999999", "Portal Member")
    member_headers = {"Authorization": f"Bearer {member['token']}"}
    assert client.get("/member/candidates", headers=member_headers).status_code == 403
    admin_auth = create_user("8847472124", "Sanjay")
    admin_headers = {"Authorization": f"Bearer {admin_auth['token']}"}
    granted = client.patch(f"/admin/users/{member['user']['id']}/access", headers=admin_headers, json={"access": ["candidate", "recruiter"]})
    assert granted.status_code == 200
    assert granted.json()["access"] == ["candidate", "recruiter"]
    assert client.get("/member/candidates", headers=member_headers).status_code == 200
    assert client.get("/member/recruiters", headers=member_headers).status_code == 200


def test_invalid_or_exhausted_otp_is_rejected():
    sent = client.post("/auth/request-otp", json={"phone": "9999999999"})
    assert sent.status_code == 200
    for _ in range(main.settings.otp_max_attempts):
        assert client.post("/auth/verify-otp", json={"phone": "9999999999", "code": "000000"}).status_code == 400
    correct = main.json.loads(main.LOCAL_OTP_OUTBOX.read_text())["code"]
    assert client.post("/auth/verify-otp", json={"phone": "9999999999", "code": correct, "name": "Late User"}).status_code == 400


def test_supabase_access_token_is_validated_and_role_is_server_controlled(monkeypatch):
    class Response:
        def __enter__(self): return self
        def __exit__(self, *_): return False
        def read(self):
            return b'{"id":"supabase-user-id","phone":"918847472124","user_metadata":{"name":"Sanjay","role":"member"}}'

    monkeypatch.setattr(main, "settings", replace(main.settings, auth_provider="supabase", supabase_url="https://example.supabase.co", supabase_publishable_key="sb_publishable_test"))
    monkeypatch.setattr(main, "urlopen", lambda *_args, **_kwargs: Response())
    overview = client.get("/admin/overview", headers={"Authorization": "Bearer supabase-access-token"})
    assert overview.status_code == 200
    user = main.read_db()["users"][0]
    assert user["role"] == "admin"


def test_admin_request_queue_filters_status_and_crud_content():
    auth = create_user("8847472124", "Sanjay")
    headers = {"Authorization": f"Bearer {auth['token']}"}
    request = client.post("/submissions", json={"type": "contact", "title": "New enquiry", "name": "Visitor", "message": "Can we talk?"})
    request_id = request.json()["id"]
    actionable = client.get("/admin/requests?status=actionable&type=contact", headers=headers)
    assert actionable.status_code == 200
    assert [item["id"] for item in actionable.json()["items"]] == [request_id]
    accepted = client.patch(f"/admin/submissions/{request_id}/status", headers=headers, json={"status": "accepted"})
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "accepted"
    assert client.get("/admin/requests?status=actionable&type=contact", headers=headers).json()["total"] == 0
    assert client.get("/admin/requests?status=accepted&type=contact", headers=headers).json()["total"] == 1

    created = client.post("/admin/content", headers=headers, json={"kind": "blog", "title": "Managed Article", "description": "Managed summary", "body": "Managed body"})
    content_id = created.json()["id"]
    updated = client.patch(f"/admin/content/blog/{content_id}", headers=headers, json={"title": "Updated Managed Article", "hidden": True, "visibility": "semi-private"})
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated Managed Article"
    assert updated.json()["hidden"] is True
    assert all(item["id"] != content_id for item in client.get("/content/blogs").json())
    deleted = client.delete(f"/admin/content/blog/{content_id}", headers=headers)
    assert deleted.json() == {"deleted": True, "id": content_id, "kind": "blog"}


def test_interview_tracker_is_admin_only_and_supports_full_company_workflow():
    member = create_user("9999999999", "Career Member")
    member_headers = {"Authorization": f"Bearer {member['token']}"}
    assert client.get("/admin/interview-tracker", headers=member_headers).status_code == 403

    admin_auth = create_user("8847472124", "Sanjay")
    headers = {"Authorization": f"Bearer {admin_auth['token']}"}
    seeded = client.get("/admin/interview-tracker", headers=headers)
    assert seeded.status_code == 200
    assert seeded.json()["total"] > 0

    created = client.post("/admin/interview-tracker", headers=headers, json={
        "company": "Test Company",
        "target_role": "Principal Engineer",
        "priority": "high",
        "status": "researching",
        "rounds_information": "Coding, system design, leadership",
        "company_values": "Customer focus and ownership",
        "contacts": "Hiring Manager · LinkedIn",
    })
    assert created.status_code == 200
    company_id = created.json()["id"]
    updated = client.patch(f"/admin/interview-tracker/{company_id}", headers=headers, json={
        "status": "applied",
        "last_applied": "2026-07-15",
        "next_action": "Ask for a referral",
    })
    assert updated.status_code == 200
    assert updated.json()["status"] == "applied"
    assert updated.json()["rounds_information"] == "Coding, system design, leadership"
    assert client.get("/admin/interview-tracker?status=applied&search=Test", headers=headers).json()["total"] == 1
    assert client.delete(f"/admin/interview-tracker/{company_id}", headers=headers).json() == {"deleted": True, "id": company_id}
    assert client.get("/admin/interview-tracker", headers=member_headers).status_code == 403


def test_local_auth_endpoints_are_closed_in_supabase_mode(monkeypatch):
    monkeypatch.setattr(main, "settings", replace(main.settings, auth_provider="supabase", supabase_url="https://example.supabase.co", supabase_publishable_key="sb_publishable_test"))
    payload = {"phone": "9999999999"}
    assert client.post("/auth/request-otp", json=payload).status_code == 404
    assert client.post("/auth/admin/request-otp", json=payload).status_code == 404
    assert client.post("/auth/verify-otp", json={**payload, "code": "123456"}).status_code == 404
    assert client.post("/auth/password", json={**payload, "password": "123456"}).status_code == 404

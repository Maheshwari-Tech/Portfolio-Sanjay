"""Create the initial Supabase phone/password admin without committing secrets."""
import json
import os
from urllib.error import HTTPError
from urllib.request import Request, urlopen


url = os.environ["SUPABASE_URL"].rstrip("/")
service_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
password = os.environ["ADMIN_INITIAL_PASSWORD"]
phone = os.getenv("ADMIN_PHONE", "+918847472124")

if len(password) < 6:
    raise SystemExit("ADMIN_INITIAL_PASSWORD must be at least six characters.")

payload = json.dumps({
    "phone": phone,
    "password": password,
    "phone_confirm": True,
    "user_metadata": {"name": "Sanjay"},
}).encode()
request = Request(
    f"{url}/auth/v1/admin/users",
    data=payload,
    method="POST",
    headers={"Authorization": f"Bearer {service_key}", "apikey": service_key, "Content-Type": "application/json"},
)

try:
    with urlopen(request, timeout=15) as response:
        user = json.loads(response.read())
except HTTPError as exc:
    raise SystemExit(f"Supabase rejected the bootstrap request: {exc.read().decode()}") from exc

print(f"Created Supabase admin {user['id']} for {phone}.")

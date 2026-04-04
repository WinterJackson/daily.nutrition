# Edwak Nutrition — Security Model

Edwak Nutrition deals with potential patient data, clinical inquiries, and business-critical operations. Security is the absolute priority, mapped across Network, Edge, and Database layers.

## 1. Zero Open Registration

The platform is explicitly designed to **prohibit public registration**.
* Account creation is handled via an **Invite-Based Provisioning Workflow**.
* Only a `SUPER_ADMIN` can dispatch an invitation token.
* Invitations are cryptographically secure, expire automatically after 48 hours, and immediately self-destruct upon use.

## 2. Defense-in-Depth Authentication

Authentication doesn't rely solely on JWTs or solely on Database queries; it employs a dual-validation model.

1. **Edge Verification (Layer 1):** The middleware intercepts the request, reads the JWT, and verifies the signature using a high-entropy `JWT_SECRET`. If invalid, the request is bounced before reaching the server logic.
2. **Deep Verification (Layer 2):** Inside every sensitive Server Action, `verifySession()` runs. It queries PostgreSQL to ensure the session exists, hasn't expired, and hasn't been revoked via the Admin Dashboard.
3. **Two-Factor Authentication (2FA):** Built on TOTP standards (`otpauth`), any user with 2FA enabled physically cannot access the `/admin` routes until a 6-digit authenticator code passes the strict time-window offset.

## 3. Cryptography & Secrets Storage

Platform credentials (e.g., Resend API Keys, Google Service Accounts) are not simply saved in plaintext in the database.

* They are run through an **AES-256-GCM** encryption loop in `src/lib/encryption.ts`.
* The Initialization Vector (IV) is uniquely generated per encryption, tied to the server's master `ENCRYPTION_KEY`.
* This prevents unauthorized actors from scraping keys directly from a database dump.

## 4. Algorithmic Rate Limiting

The application eschews expensive Redis instances by utilizing an in-memory sliding window algorithm (`src/lib/rate-limit.ts`).

| Action | Limit | Window | Purpose |
| :--- | :--- | :--- | :--- |
| **Login Attempts** | 5 | 1 minute | Prevents brute-force password attacks |
| **Password Reset** | 3 | 15 minutes | Mitigates email enumeration & spam |
| **Contact Form** | 10 | 5 minutes | Prevents API flooding and inbox spam |
| **File Uploads** | 10 | 1 minute | Secures the Cloudinary pipeline |

## 5. File Upload Sanitation

Handled in `/api/upload`:
1. **Strict MIME Matching:** Only explicit types (`image/jpeg`, `image/webp`, `image/png`, `application/pdf`, etc.) are processed. 
2. **Buffer Limitations:** Imposes strict byte-size ceilings depending on the payload target (e.g., 5MB for profile imagery, 50MB for general assets).

## 6. Access Control (RBAC)

Roles are strictly defined:
* `ADMIN`: Can manage content, answer inquiries, and manage bookings.
* `SUPER_ADMIN`: Receives all `ADMIN` privileges, plus the capability to access system environment secrets, global settings, and invite/revoke other staff members.

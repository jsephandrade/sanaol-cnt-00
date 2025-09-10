import os
from uuid import uuid4
from django.db import models
from django.utils import timezone

try:
    from .storage import PrivateMediaStorage
except Exception:  # fallback if storage cannot be imported during migrations
    PrivateMediaStorage = None


class AppUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=32, default="staff")
    status = models.CharField(max_length=32, default="active")
    permissions = models.JSONField(default=list, blank=True)
    password_hash = models.CharField(max_length=128, blank=True)
    avatar = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)
    email_verified = models.BooleanField(default=False)

    class Meta:
        db_table = "app_user"

    def __str__(self) -> str:
        return f"{self.email} ({self.role})"


def _headshot_upload_path(instance, filename):
    # Store under a per-user folder with a random filename; keep extension if present
    base, ext = os.path.splitext(filename or "")
    ext = ext if ext else ".bin"
    return f"access_requests/{instance.user_id}/{uuid4().hex}{ext}"


class AccessRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    # One request per user account (update in place on resubmission)
    user = models.OneToOneField(
        AppUser,
        on_delete=models.CASCADE,
        related_name="access_request",
    )
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)

    # Evidence
    headshot = models.FileField(
        upload_to=_headshot_upload_path,
        blank=True,
        null=True,
        storage=PrivateMediaStorage() if PrivateMediaStorage else None,
    )
    consent_at = models.DateTimeField(blank=True, null=True)
    code = models.CharField(max_length=32, blank=True, null=True)
    extra = models.JSONField(default=dict, blank=True)

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    verified_by = models.CharField(max_length=255, blank=True, null=True, help_text="Verifier identifier (e.g., email)")
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "access_request"

    def mark_consented(self):
        self.consent_at = timezone.now()
        self.save(update_fields=["consent_at"]) 

    def approve(self, verifier_identifier: str = ""):
        self.status = self.STATUS_APPROVED
        self.verified_at = timezone.now()
        self.verified_by = verifier_identifier or self.verified_by
        self.save(update_fields=["status", "verified_at", "verified_by"]) 

    def reject(self, verifier_identifier: str = "", note: str = ""):
        self.status = self.STATUS_REJECTED
        self.verified_at = timezone.now()
        self.verified_by = verifier_identifier or self.verified_by
        if note:
            self.notes = (self.notes or "") + ("\n" if self.notes else "") + note
        self.save(update_fields=["status", "verified_at", "verified_by", "notes"]) 


class RefreshToken(models.Model):
    """Persistent refresh token with rotation and revocation support.

    The raw token is only shown to the client once and its SHA256 is stored.
    """

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="refresh_tokens")
    token_hash = models.CharField(max_length=128, unique=True)
    remember = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(blank=True, null=True)
    rotated_from = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="rotated_to"
    )
    user_agent = models.CharField(max_length=256, blank=True)
    ip_address = models.CharField(max_length=64, blank=True)

    class Meta:
        db_table = "refresh_token"
        indexes = [
            models.Index(fields=["user", "expires_at"]),
        ]

    @property
    def is_active(self) -> bool:
        if self.revoked_at:
            return False
        return timezone.now() < self.expires_at


class ResetToken(models.Model):
    """One-time password reset token with optional 6-digit code fallback."""

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="reset_tokens")
    token_hash = models.CharField(max_length=128, unique=True)
    code_hash = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(blank=True, null=True)
    revoked_at = models.DateTimeField(blank=True, null=True)
    ip_address = models.CharField(max_length=64, blank=True)
    user_agent = models.CharField(max_length=256, blank=True)
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "reset_token"
        indexes = [
            models.Index(fields=["user", "expires_at"]),
        ]

    @property
    def is_active(self) -> bool:
        if self.revoked_at or self.used_at:
            return False
        return timezone.now() < self.expires_at


class PasswordResetCode(models.Model):
    """Short‑lived OTP for password reset verification.

    Stores only a SHA256 hash of the 6‑digit code. Single‑use with
    attempt tracking and strict expiry.
    """

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="password_reset_codes")
    code_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used = models.BooleanField(default=False)

    class Meta:
        db_table = "password_reset_code"
        indexes = [
            models.Index(fields=["user", "expires_at", "used"]),
        ]

    @property
    def is_active(self) -> bool:
        if self.used:
            return False
        return timezone.now() < self.expires_at


def _facetpl_upload_path(instance, filename):
    base, ext = os.path.splitext(filename or "")
    ext = ext if ext else ".jpg"
    return f"face_templates/{instance.user_id}/{uuid4().hex}{ext}"


class FaceTemplate(models.Model):
    """Simple face template using perceptual/average hash of a reference image.

    Note: This is a lightweight demonstration and not a substitute for
    production-grade biometric matching. Hash collisions and false positives
    are possible; tune thresholds accordingly.
    """

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.OneToOneField(AppUser, on_delete=models.CASCADE, related_name="face_template")
    ahash = models.CharField(max_length=16)  # 64-bit average hash as 16-hex
    reference = models.FileField(
        upload_to=_facetpl_upload_path,
        blank=True,
        null=True,
        storage=PrivateMediaStorage() if PrivateMediaStorage else None,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "face_template"

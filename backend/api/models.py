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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(blank=True, null=True)

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

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
import django; django.setup()
from api.models import AppUser
print('\n'.join([f"{u.name} <{u.email}> role={u.role} status={u.status}" for u in AppUser.objects.all()]))

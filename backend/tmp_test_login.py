import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
import django
django.setup()
from django.test import RequestFactory
from api.views import auth_login
rf=RequestFactory()
req=rf.post('/api/auth/login',data='{"email":"josephformentera2@gmail.com","password":"technomart_4"}',content_type='application/json')
resp=auth_login(req)
print(resp.status_code)
print(resp.content.decode())

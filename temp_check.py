# -*- coding: utf-8 -*-
from pathlib import Path
import re
text = Path('src/components/employee-schedule/EmployeeDirectoryPanel.jsx').read_text(encoding='utf-8')
pattern = re.compile('Hourly rate [^<]*</Label>')
match = pattern.search(text)
print(bool(match))
if match:
    print(match.group(0))

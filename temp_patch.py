# -*- coding: utf-8 -*-
from pathlib import Path
import re
path = Path('src/components/employee-schedule/EmployeeDirectoryPanel.jsx')
text = path.read_text(encoding='utf-8')
text = re.sub(r'Hourly rate [^<]*</Label>', 'Hourly rate (ƒ,ñ)</Label>', text)
path.write_text(text, encoding='utf-8')

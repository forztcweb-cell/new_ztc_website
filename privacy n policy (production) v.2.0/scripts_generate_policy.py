import json, re, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path('/home/ubuntu/zatics')
DOCX = Path('/home/ubuntu/upload/Zatics_Intelligence_Privacy_Policy_v2.0-2(1).docx')
OUT = ROOT / 'policy-data.js'
NS = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def norm(text):
    return re.sub(r'\s+', ' ', text).strip()

def paragraph_text(el):
    return norm(''.join(el.itertext()))

def paragraph_style(el):
    ppr = el.find('w:pPr', NS)
    if ppr is None: return ''
    sty = ppr.find('w:pStyle', NS)
    return sty.get('{%s}val' % NS['w']) if sty is not None else ''

def table_rows(el):
    rows=[]
    for tr in el.findall('./w:tr', NS):
        row=[]
        for tc in tr.findall('./w:tc', NS):
            row.append(norm(''.join(tc.itertext())))
        if any(row): rows.append(row)
    return rows

def parse_heading(text, style):
    text = text.replace('\u2003', ' ')
    if style == 'Heading1':
        m = re.match(r'^(\d+)\.\s+(.+)$', text)
        if m: return 'section', m.group(1), m.group(2).strip()
    if style == 'Heading2':
        m = re.match(r'^(\d+\.\d+)\s+(.+)$', text)
        if m: return 'subsection', m.group(1), m.group(2).strip()
    return None

with zipfile.ZipFile(DOCX) as z:
    root = ET.fromstring(z.read('word/document.xml'))
    body = root.find('w:body', NS)
    children = list(body)
    # The first table is document metadata; the first Heading1 begins the legal body.
    metadata = {}
    for i, el in enumerate(children):
        if el.tag.endswith('}tbl'):
            rows = table_rows(el)
            if i < 10:
                metadata = {row[0]: row[1] for row in rows if len(row) >= 2}
            break
    blocks=[]
    started=False
    current_section_id=None
    for el in children:
        if el.tag.endswith('}p'):
            text=paragraph_text(el)
            if not text: continue
            style=paragraph_style(el)
            heading=parse_heading(text, style)
            if heading and heading[0]=='section' and heading[1]=='1': started=True
            if not started: continue
            if heading:
                kind, number, title = heading
                block={'type':kind,'number':number,'title':title,'id':'section-'+number.replace('.','-')}
                if kind == 'section':
                    current_section_id = block['id']
            else:
                block={'type':'paragraph','text':text}
            block['sectionId'] = current_section_id
            blocks.append(block)
        elif el.tag.endswith('}tbl') and started:
            rows=table_rows(el)
            if rows:
                blocks.append({'type':'table','headers':rows[0],'rows':rows[1:],'sectionId':current_section_id})

# Collect the top-level sections and subsections for generated navigation.
sections=[]
for b in blocks:
    if b['type']=='section':
        sections.append({'number':b['number'],'title':b['title'],'id':b['id'],'subsections':[]})
    elif b['type']=='subsection' and sections:
        sections[-1]['subsections'].append({'number':b['number'],'title':b['title'],'id':b['id']})

payload={'metadata':metadata,'sections':sections,'blocks':blocks}
OUT.write_text('window.POLICY_DATA = '+json.dumps(payload, ensure_ascii=False, indent=2)+';\n')
print(f'Wrote {OUT} with {len(blocks)} blocks, {len(sections)} sections, {sum(len(s["subsections"]) for s in sections)} subsections')

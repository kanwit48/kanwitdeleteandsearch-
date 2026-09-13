import os
import re
from PIL import Image, ImageDraw, ImageFont
from pygments import highlight
from pygments.lexers import TypeScriptLexer
from pygments.formatter import Formatter

# Read the source code
code_path = r"C:\Users\stdee\OneDrive\เอกสาร\ReactNativeProjects\kanwit\src\app\index.tsx"
with open(code_path, "r", encoding="utf-8") as f:
    code = f.read()

class TokenCollector(Formatter):
    def __init__(self, **options):
        super().__init__(**options)
        self.tokens = []

    def format(self, tokensource, outfile):
        for ttype, value in tokensource:
            self.tokens.append((ttype, value))

lexer = TypeScriptLexer()
formatter = TokenCollector()
highlight(code, lexer, formatter)

# Color Scheme (VS Code / Catppuccin Mocha)
THEME = {
    "background": (30, 30, 46),
    "header_bg": (24, 24, 37),
    "header_border": (49, 50, 68),
    "line_num": (108, 112, 134),
    "line_num_border": (49, 50, 68),
    "text": (205, 214, 244),
    "keyword": (203, 166, 247),
    "string": (166, 227, 161),
    "comment": (108, 112, 134),
    "number": (250, 179, 135),
    "function": (137, 180, 250),
    "operator": (148, 226, 213),
    "punctuation": (186, 194, 222),
    "tag": (243, 139, 168),
    "attribute": (249, 226, 175),
    "type": (249, 226, 175),
}

def get_token_color(ttype):
    ts = str(ttype)
    if "Keyword" in ts:
        return THEME["keyword"]
    elif "String" in ts:
        return THEME["string"]
    elif "Comment" in ts:
        return THEME["comment"]
    elif "Number" in ts:
        return THEME["number"]
    elif "Name.Function" in ts or "Name.Builtin" in ts:
        return THEME["function"]
    elif "Name.Tag" in ts or "Name.Class" in ts:
        return THEME["tag"]
    elif "Name.Attribute" in ts:
        return THEME["attribute"]
    elif "Operator" in ts:
        return THEME["operator"]
    elif "Punctuation" in ts:
        return THEME["punctuation"]
    elif "Name" in ts:
        return THEME["text"]
    return THEME["text"]

# Load Fonts
font_code = ImageFont.truetype("consola.ttf", 22)
font_code_bold = ImageFont.truetype("consolab.ttf", 22)
font_thai = ImageFont.truetype("tahoma.ttf", 20)
font_thai_bold = ImageFont.truetype("tahomabd.ttf", 20)
header_font = ImageFont.truetype("arialbd.ttf", 20)
line_font = ImageFont.truetype("consola.ttf", 20)

def is_thai(text):
    return any("\u0e00" <= ch <= "\u0e7f" for ch in text)

def draw_mixed_text(draw_ctx, x, y, text, color, is_bold=False):
    # Split text into Thai chunks and English/Code chunks
    chunks = re.findall(r"[\u0e00-\u0e7f]+|[^\u0e00-\u0e7f]+", text)
    cx = x
    for chk in chunks:
        if is_thai(chk):
            f = font_thai_bold if is_bold else font_thai
            draw_ctx.text((cx, y - 1), chk, font=f, fill=color)
            bbox = draw_ctx.textbbox((0, 0), chk, font=f)
            cx += (bbox[2] - bbox[0])
        else:
            f = font_code_bold if is_bold else font_code
            draw_ctx.text((cx, y), chk, font=f, fill=color)
            bbox = draw_ctx.textbbox((0, 0), chk, font=f)
            cx += (bbox[2] - bbox[0])
    return cx

# Measurements
lines = code.split("\n")
num_lines = len(lines)
max_chars = max(len(l) for l in lines) if lines else 80

line_height = 34
char_width = 13.5

pad_x = 55
pad_y = 55
header_height = 54
line_num_width = 75
code_pad_left = 25
code_pad_right = 50
code_pad_bottom = 40

content_width = int(line_num_width + code_pad_left + (max_chars * char_width) + code_pad_right)
content_width = max(content_width, 1150)
content_height = header_height + (num_lines * line_height) + code_pad_bottom

total_width = content_width + (pad_x * 2)
total_height = content_height + (pad_y * 2)

img = Image.new("RGB", (total_width, total_height))
draw = ImageDraw.Draw(img)

# Gradient fill
for y in range(total_height):
    ratio = y / total_height
    r = int(99 * (1 - ratio) + 236 * ratio)
    g = int(102 * (1 - ratio) + 72 * ratio)
    b = int(241 * (1 - ratio) + 153 * ratio)
    draw.line([(0, y), (total_width, y)], fill=(r, g, b))

wx0 = pad_x
wy0 = pad_y
wx1 = total_width - pad_x
wy1 = total_height - pad_y
radius = 20

# Shadow
shadow_layers = 15
for s in range(shadow_layers, 0, -1):
    s_offset = s * 2
    draw.rounded_rectangle(
        [wx0 - s + 4, wy0 - s + 8 + s_offset, wx1 + s - 4, wy1 + s + s_offset],
        radius=radius + 2,
        fill=(0, 0, 0)
    )

draw.rounded_rectangle([wx0, wy0, wx1, wy1], radius=radius, fill=THEME["background"])
draw.rounded_rectangle([wx0, wy0, wx1, wy0 + header_height + radius], radius=radius, fill=THEME["header_bg"])
draw.rectangle([wx0, wy0 + header_height, wx1, wy0 + header_height + 1], fill=THEME["header_border"])

# Header Dots
dot_y = wy0 + (header_height // 2)
dots = [
    (wx0 + 25, dot_y, (255, 95, 86)),
    (wx0 + 48, dot_y, (255, 189, 46)),
    (wx0 + 71, dot_y, (39, 201, 63)),
]
for dx, dy, color in dots:
    draw.ellipse([dx - 7, dy - 7, dx + 7, dy + 7], fill=color)

# Header Title
draw.text((wx0 + 105, dot_y - 12), "kanwit/src/app/index.tsx", font=header_font, fill=(166, 173, 200))

# Line Numbers Divider
sep_x = wx0 + line_num_width + 10
draw.line([(sep_x, wy0 + header_height), (sep_x, wy1 - 10)], fill=THEME["line_num_border"], width=1)

# Draw Line Numbers
for i in range(1, num_lines + 1):
    ly = wy0 + header_height + 20 + ((i - 1) * line_height)
    num_str = str(i)
    bbox = draw.textbbox((0, 0), num_str, font=line_font)
    nw = bbox[2] - bbox[0]
    draw.text((sep_x - nw - 12, ly + 2), num_str, font=line_font, fill=THEME["line_num"])

# Draw Code Tokens
cur_x = sep_x + code_pad_left
cur_y = wy0 + header_height + 20

for ttype, text in formatter.tokens:
    color = get_token_color(ttype)
    is_bold = "Keyword" in str(ttype)
    parts = text.split("\n")
    for idx, part in enumerate(parts):
        if idx > 0:
            cur_y += line_height
            cur_x = sep_x + code_pad_left
        if part:
            cur_x = draw_mixed_text(draw, cur_x, cur_y, part, color, is_bold=is_bold)

# Save output image
out_path = r"C:\Users\stdee\OneDrive\เอกสาร\ReactNativeProjects\kanwit\index_tsx_codesnap.png"
img.save(out_path, "PNG", quality=95)

# Also copy to artifact directory
artifact_path = r"C:\Users\stdee\.gemini\antigravity\brain\49dd0954-320f-4627-8b11-6de28e40e7e5\index_tsx_codesnap.png"
img.save(artifact_path, "PNG", quality=95)
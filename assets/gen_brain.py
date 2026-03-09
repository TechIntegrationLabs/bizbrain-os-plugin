from PIL import Image, ImageDraw, ImageFilter
import random

random.seed(42)

# Create a refined brain shape
width, height = 500, 420
img = Image.new('L', (width, height), 0)
draw = ImageDraw.Draw(img)

# Main cerebrum (side view)
draw.ellipse([50, 20, 400, 300], fill=240)
draw.ellipse([30, 40, 200, 260], fill=240)

# Cerebellum
draw.ellipse([280, 220, 420, 340], fill=220)

# Brain stem
draw.polygon([(220, 280), (270, 280), (260, 400), (230, 400)], fill=200)

# Major sulci (dark fold lines)
draw.arc([80, 30, 350, 200], 0, 180, fill=0, width=6)
draw.arc([60, 80, 380, 250], 10, 170, fill=0, width=6)
draw.arc([100, 140, 320, 280], 20, 160, fill=0, width=5)
draw.arc([50, 50, 250, 160], 0, 180, fill=0, width=4)
draw.arc([40, 80, 220, 190], 0, 180, fill=0, width=4)
draw.arc([80, 190, 300, 290], 0, 160, fill=0, width=4)

# Minor folds for texture
draw.arc([70, 60, 300, 170], 5, 175, fill=80, width=3)
draw.arc([90, 110, 340, 230], 5, 175, fill=80, width=3)
draw.arc([60, 160, 280, 270], 10, 160, fill=80, width=3)

# Cerebellum lines
for i in range(6):
    y = 225 + i * 16
    draw.arc([290, y, 415, y + 28], 0, 180, fill=0, width=3)

# Smooth edges
img = img.filter(ImageFilter.GaussianBlur(radius=1.2))

# Convert to ASCII
img2 = img.convert('L')
cols = 58
ratio = img2.height / img2.width
rows = int(cols * ratio * 0.48)
img2 = img2.resize((cols, rows))

# ANSI 256 colors
GREEN = '\033[38;5;114m'
AMBER = '\033[38;5;180m'
BLUE = '\033[38;5;110m'
PURPLE = '\033[38;5;176m'
ORANGE = '\033[38;5;173m'
WHITE = '\033[38;5;145m'
DIM = '\033[38;5;59m'
RED = '\033[38;5;168m'
RESET = '\033[0m'

slash_chars = ['/', '|', '_', '-']
bracket_chars = ['[', ']', '(', ')']
brace_chars = ['{', '}']
operator_chars = ['<', '>', '+', '-', '=']
special_chars = ['*', '#', '@', '$', '&']

def get_char_and_color(brightness):
    if brightness < 20:
        return (' ', '')
    elif brightness < 50:
        c = random.choice(['.', ',', ':', ';'])
        return (c, DIM)
    elif brightness < 90:
        c = random.choice(['-', '~', '=', '+', '*'])
        return (c, random.choice([DIM, BLUE]))
    elif brightness < 130:
        c = random.choice(slash_chars + operator_chars)
        return (c, random.choice([BLUE, ORANGE, PURPLE]))
    elif brightness < 170:
        c = random.choice(bracket_chars + brace_chars + ['*', '#'])
        return (c, random.choice([GREEN, AMBER, PURPLE]))
    elif brightness < 210:
        c = random.choice(brace_chars + bracket_chars + operator_chars + ['#', '@'])
        return (c, random.choice([GREEN, AMBER, WHITE, BLUE]))
    else:
        c = random.choice(special_chars + brace_chars + bracket_chars)
        return (c, random.choice([GREEN, AMBER, WHITE, ORANGE]))

for y in range(rows):
    line = ""
    for x in range(cols):
        b = img2.getpixel((x, y))
        char, color = get_char_and_color(b)
        if color:
            line += f"{color}{char}{RESET}"
        else:
            line += char
    print(line)

print()

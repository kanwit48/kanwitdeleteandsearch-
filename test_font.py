from PIL import ImageFont

for name in ["consola.ttf", "tahoma.ttf", "tahomabd.ttf", "LeelaUIb.ttf", "leelawad.ttf", "segoeui.ttf", "arial.ttf"]:
    try:
        f = ImageFont.truetype(name, 22)
        print("Loaded", name)
    except Exception as e:
        print("Failed", name, e)
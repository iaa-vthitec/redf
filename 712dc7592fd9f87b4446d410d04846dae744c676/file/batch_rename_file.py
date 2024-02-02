import os
import glob


def main():
    folder = "DART_V1.0_Download/20_Digital_Skills_Review"
    for source_filename in os.listdir(folder):
        # if "." in source_filename:
        new_filename = ""
        for ch in source_filename:
            if ch == " ":
                ch = "_"
            new_filename += ch
        print(source_filename)
        print(new_filename)
        os.replace("./" + folder + "/" + source_filename, "./" + folder + "/" + new_filename)


def html_converter():
    folder = "DART_V1.0_Download/**/*.pdf"
    for filename in glob.glob(folder, recursive=True):
        if ".PDF" in filename.upper():
            output = "<li><a href=\"../file/" + folder[0:17] + "/" + filename + '">Lesson Description</a></li>'
            print(output)


if __name__ == '__main__':
    html_converter()
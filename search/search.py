#!/usr/bin/env python

import argparse
import csv
import os
import os.path

import numpy as np
from fuzzywuzzy import fuzz
from Xlib import display

DLPATH = os.path.join(os.path.expanduser("~"), "downloads", "kaneda-tmp", "test.txt")
BASE_URL = "http://www.184213072193821491204721904321.xyz"
DEBUG = False
FIREFOX_WINDOW = -1


def _debug_print(*args, **kwargs):
    if DEBUG:
        print(*args, **kwargs)


def get_all_tabs():
    titles = []
    wintabIds = []

    with open(DLPATH) as csvDataFile:
        csvReader = csv.reader(csvDataFile)
        for row in csvReader:
            wintabIds.append((row[0], row[1]))
            titles.append(row[2])
    return wintabIds, titles


def get_available_programs(contains=""):
    available_programs_str = os.popen(
        "echo -n $PATH | xargs -d : -I {} find {} -maxdepth 1 -executable -type f -printf '%P\n' | sort -u | grep '"
        + contains
        + "'"
    ).read()
    available_programs = available_programs_str.split("\n")
    _debug_print(f"Returning available program: {available_programs[:-1]}")
    return available_programs[:-1]


def get_all_windows(root):
    global FIREFOX_WINDOW

    names = []
    classes = []
    ids = []

    _debug_print("Listing found windows...")

    for child in root.query_tree().children:
        _debug_print(f"\n[CHILD] {child.get_wm_name()} – {child.id}")
        grandchildren = child.query_tree().children
        for grandchild in grandchildren:
            name = grandchild.get_wm_name()
            _debug_print(f"  > {name} – {grandchild.id}")
            if name and "search.py " not in name:
                if "Firefox" in name:
                    FIREFOX_WINDOW = grandchild.id
                names.append(name)
                class_tuple = grandchild.get_wm_class()
                classes.append(class_tuple[0] + class_tuple[1])
                ids.append(grandchild.id)
                # _debug_print(grandchild.query_tree())

    return ids, names, classes


def get_ratio_combined(word, classes, names):
    word = word.lower()
    _debug_print(classes)

    ratio_classes = get_ratio(word, classes)
    ratio_names = get_ratio(word, names)

    return ratio_classes + ratio_names


def get_ratio(word, names):
    return np.array(
        list(map(lambda name: fuzz.partial_ratio(word, name.lower()), names))
    )


def best_match(word, classes, names):
    return np.argsort(-get_ratio_combined(word, classes, names))


def execute_line(line):
    os.system(line)


def visit_id(wid):
    global FIREFOX_WINDOW

    if type(wid) is not tuple:
        os.system("xdotool windowactivate --sync " + str(wid))
    else:
        os.system("xdotool windowactivate --sync " + str(FIREFOX_WINDOW))
        os.system(f"firefox {BASE_URL}/{wid[0]}/{wid[1]}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("--debug", action="store_true", help="Print debug output")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    DEBUG = args.debug

    root = display.Display().screen().root
    # _debug_print(get_available_programs())
    # execute_line("firefox")

    ids, names, classes = get_all_windows(root)
    ids_arr: np.array = np.array(ids)
    names_arr: np.array = np.array(names)

    tab_ids, tab_names = get_all_tabs()
    tab_ids_arr: np.array = np.array(tab_ids)
    tab_names_arr: np.array = np.array(names)

    if not tab_ids:
        classes_names_ratio = get_ratio_combined(args.query, classes, names_arr)
        order = np.argsort(-classes_names_ratio)

        total_names = names_arr[order]
        total_ids = ids_arr[order]

        _debug_print(f"Found IDs / names / classes (sorted): \n{ids_names_matrix}")
    else:
        classes_names_ratio = get_ratio_combined(args.query, classes, names_arr)
        tabs_ratio = get_ratio(args.query, tab_names)

        total_names = np.concatenate([names_arr, tab_names])
        total_ids = list(ids_arr) + tab_ids
        total_ratio = np.concatenate([classes_names_ratio, tabs_ratio])
        order = np.argsort(-total_ratio)

        print(total_names[order])
        print(total_ids)

    ids_names_matrix: np.vstack = np.vstack([ids_arr, names_arr, np.array(classes)]).T

    _debug_print(f"Going to ID {total_ids[order[0]]}, title {total_names[order[0]]}")
    print(total_ids)
    print(total_names)

    if not args.dry_run:
        if total_names[order[0]] == f"k '{args.query}'":
            visit_id(total_ids[order[1]])
            print(f"Going to ID {total_ids[order[1]]}, title {total_names[order[0]]}")
            print(f"Going to ID {total_names[order]}")
        else:
            visit_id(total_ids[order[0]])
            print(f"Going to ID {total_ids[order[0]]}, title {total_names[order[0]]}")

#!/usr/bin/env python

import argparse
import os

import numpy as np
from fuzzywuzzy import fuzz
from Xlib import display

DEBUG = False


def _debug_print(*args, **kwargs):
    if DEBUG:
        print(*args, **kwargs)


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
    names = []
    classes = []
    ids = []

    _debug_print("Listing found windows...")

    for child in root.query_tree().children:
        _debug_print(f"[CHILD] {child.get_wm_name()}")
        grandchildren = child.query_tree().children
        for grandchild in grandchildren:
            name = grandchild.get_wm_name()
            _debug_print(f"  > {name}")
            if name and "search.py " not in name:
                _debug_print(f"{grandchild.get_wm_name()} – {grandchild.id}")
                names.append(name)
                class_tuple = grandchild.get_wm_class()
                classes.append(class_tuple[0] + class_tuple[1])
                ids.append(grandchild.id)
                # _debug_print(grandchild.query_tree())
        _debug_print("")

    return ids, names, classes


def best_match(word, classes, names):
    word = word.lower()
    _debug_print(classes)
    ratio_classes = list(
        map(lambda name: fuzz.partial_ratio(word, name.lower()), classes)
    )
    ratio_names = list(map(lambda name: fuzz.partial_ratio(word, name), names))

    total_ratio = np.array(ratio_classes) + np.array(ratio_names)

    return np.argsort(-total_ratio)


def execute_line(line):
    os.system(line)


def visit_id(wid):
    os.system("xdotool windowactivate --sync " + str(wid))


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

    sorted_match = best_match(args.query, classes, names_arr)

    _debug_print(f"Found IDs (sorted): {ids_arr[sorted_match]}")
    _debug_print(f"Found names (sorted): {names_arr[sorted_match]}")
    _debug_print(
        f"Going to ID {ids_arr[sorted_match[0]]}, title {names_arr[sorted_match[0]]}"
    )

    if not args.dry_run:
        visit_id(ids[sorted_match[0]])

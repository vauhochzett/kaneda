#!/usr/bin/env python

import os
import argparse
import numpy as np
from Xlib import display
from fuzzywuzzy import fuzz

def get_available_programs(contains=""):
    available_programs_str = os.popen("echo -n $PATH | xargs -d : -I {} find {} -maxdepth 1 -executable -type f -printf '%P\n' | sort -u | grep '" + contains +"'").read()
    available_programs = available_programs_str.split('\n')
    return available_programs[:-1]
    #print(available_programs[:-1])

def get_all_windows(root):
    names = []
    classes = []
    ids = []

    for child in root.query_tree().children:
        for grandchild in child.query_tree().children:
            name = grandchild.get_wm_name()
            if name:
                print(f"{grandchild.get_wm_name()} – {grandchild.id}")
                names.append(name)
                classes.append(grandchild.get_wm_class())
                ids.append(grandchild.id)
                #print(grandchild.query_tree())
    return ids, names, classes

def best_match(word, classes, names):
    ratio_classes = list(map(lambda name: fuzz.ratio(word, name), classes))
    ratio_names = list(map(lambda name: fuzz.ratio(word, name), names))

    total_ratio = np.array(ratio_classes) + np.array(ratio_names)

    return np.argsort(-total_ratio)

def execute_line(line):
    os.system(line)


def visit_id(wid):
    os.system("xdotool windowactivate --sync " + str(wid))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    args = parser.parse_args()

    print(args.query)

    root = display.Display().screen().root
    #print(get_available_programs())
    #execute_line("firefox")

    ids, names, classes = (get_all_windows(root))
    ids = np.array(ids)
    names = np.array(names)
    
    sorted_match = (best_match(args.query, classes, names))
    print(ids[sorted_match])
    print(names[sorted_match])
    print("Going to")
    print(ids[sorted_match[1]])
    print(names[sorted_match[1]])
    visit_id(ids[sorted_match[1]])

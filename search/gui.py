#!/usr/bin/env python3

import curses
from curses.textpad import Textbox, rectangle


def main(stdscr):
    stdscr.addstr(0, 0, "")

    stdscr.refresh()

    box = Textbox(stdscr)

    # Let the user edit until Ctrl-G is struck.
    box.edit()

    # Get resulting contents
    message = box.gather()


if __name__ == "__main__":
    screen = curses.initscr()
    curses.noecho()
    main(screen)
    # curses.endwin()

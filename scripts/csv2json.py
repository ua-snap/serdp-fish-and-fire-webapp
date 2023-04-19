#!/usr/bin/env python
import argparse
import csv
import json
import numpy as np
import pandas as pd
import sys
from collections import defaultdict

column_settings = {
    "Fish_Growth_by_AOI.csv": {
        "group": [
            "AOI",
            "FMO",
            "StreamOrder",
            "Model",
            "Period",
        ],
        "omit": [
            "RCA",
        ],
    },
    "Hydrograph_Data_by_AOI.csv": {
        "group": [
            "AOI",
            "StreamOrder",
            "Model",
            "Period",
            "doy",
        ],
        "omit": [],
    },
    "Hydrology_Stats_by_AOI.csv": {
        "group": [
            "AOI",
            "StreamOrder",
            "Model",
            "Period",
        ],
        "omit": [
            "RCA",
            "ReachID",
        ],
    },
    "Riparian_Fire_Impact_by_AOI.csv": {
        "group": ["AOI", "FMO", "Species", "Model", "Period"],
        "omit": [],
    },
    "Stream_Temp_Stats_by_AOI.csv": {
        "group": ["AOI", "StreamOrder", "Model", "Period"],
        "omit": [
            "RCA",
        ],
    },
}

parser = argparse.ArgumentParser(description="Convert CSV file to JSON.")
parser.add_argument("input_file", type=str, help="input CSV file")
parser.add_argument("output_file", type=str, help="output JSON file")
args = parser.parse_args()


# Solution for recursive defaultdict of arbitrary depth taken from here:
# https://stackoverflow.com/questions/67930334/create-a-nested-dictionary-of-arbitrary-depth-in-python
def recursive_dict():
    return defaultdict(recursive_dict)


# Take the mean of all leaf arrays of the data dict.
# If leaf array is entirely nodata (-9999), set to None.
def recursive_mean(data_dict):
    for key in data_dict:
        if isinstance(data_dict[key], list):
            data_dict[key] = [
                item for item in data_dict[key] if not np.isclose(item, -9999)
            ]
            if len(data_dict[key]) == 0:
                data_dict[key] = None
            else:
                data_dict[key] = round(np.mean(data_dict[key]), 2)
        else:
            recursive_mean(data_dict[key])


df = pd.read_csv(args.input_file)

# Replace NaNs and INFs with -9999 nodata value.
df = df.replace([np.nan, np.inf], -9999)

# pd.read_csv() may have converted this to a float. Convert it back to int.
if "StreamOrder" in df:
    df["StreamOrder"] = df["StreamOrder"].astype(int)

headers = df.columns.tolist()

for filename in column_settings.keys():
    if filename in args.input_file:
        group_headers = column_settings[filename]["group"]
        omit_headers = column_settings[filename]["omit"]

for header in group_headers:
    # Reorder headers.
    old_index = headers.index(header)
    new_index = group_headers.index(header)
    headers.insert(new_index, headers.pop(old_index))

# Reorder data columns to match reordered headers.
df = df[headers]

last_group_index = len(group_headers)
data_dict = recursive_dict()

for row in df.values.tolist():
    include_row = True
    # Crawl through nested dict path until we get to the final nested dict
    # that stores the values.
    value_dict = data_dict
    for index in range(0, last_group_index):
        if row[index] == -9999:
            include_row = False
            break
        value_dict = value_dict[row[index]]

    if include_row:
        # Add leaves (values) to this branch of the nested dict.
        for index in range(last_group_index, len(row)):
            if headers[index] not in omit_headers:
                if headers[index] not in dict(value_dict):
                    value_dict[headers[index]] = []
                value_dict[headers[index]].append(row[index])

recursive_mean(data_dict)

with open(args.output_file, "w") as jsonfile:
    json.dump(dict(data_dict), jsonfile, indent=4)

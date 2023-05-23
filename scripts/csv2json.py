#!/usr/bin/env python
import csv
import hashlib
import json
import os
import re
import numpy as np
import pandas as pd
from collections import defaultdict

runs = [
    {
        "input_file": "input/Fish_Growth_by_AOI.csv",
        "output_dir": "../assets/data/fish_growth",
    },
    {
        "input_file": "input/Hydrograph_Data_by_AOI.csv",
        "output_dir": "../assets/data/hydrograph_data",
    },
    {
        "input_file": "input/Hydrology_Stats_by_AOI.csv",
        "output_dir": "../assets/data/hydrology_stats",
    },
    {
        "input_file": "input/Riparian_Fire_Impact_by_AOI.csv",
        "output_dir": "../assets/data/riparian_fire_impact",
    },
    {
        "input_file": "input/Stream_Temp_Stats_by_AOI.csv",
        "output_dir": "../assets/data/stream_temp_stats",
    },
]

hash_map_path = "../assets/hash_map.json"

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

aoi_name_fixes = {
    "Fire Managment Zone DAS": "Fire Management Zone DAS",
    "Fire Managment Zone FAS": "Fire Management Zone FAS",
    "Fire Managment Zone MID": "Fire Management Zone MID",
}

hash_map = {}
for run in runs:
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

    df = pd.read_csv(run["input_file"])

    # Replace NaNs and INFs with -9999 nodata value.
    df = df.replace([np.nan, np.inf], -9999)

    # pd.read_csv() may have converted this to a float. Convert it back to int.
    if "StreamOrder" in df:
        df["StreamOrder"] = df["StreamOrder"].astype(int)

    headers = df.columns.tolist()

    for filename in column_settings.keys():
        if filename in run["input_file"]:
            group_headers = column_settings[filename]["group"]
            omit_headers = column_settings[filename]["omit"]

    # Reorder headers to match order specifed in the CSV file's "group" array
    # set near the top of this script. This gives us more control over the JSON
    # tree hiearchy so we can format the data in a way that's easier for our Plotly
    # code to navigate.
    for header in group_headers:
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
            # Ignore group-by values that were blank in source CSV and got
            # converted to -9999 earlier in the script. Some StreamOrder values are
            # blank in the source CSVs, for example.
            if row[index] == -9999:
                include_row = False
                break

            # If the dictionary/JSON key is an AOI name, fix it if necessary.
            key = row[index]
            if group_headers[index] == "AOI" and key in aoi_name_fixes.keys():
                key = aoi_name_fixes[key]

            value_dict = value_dict[key]

        # Add leaves (values) to this branch of the nested dict.
        if include_row:
            for index in range(last_group_index, len(row)):
                if headers[index] not in omit_headers:
                    if headers[index] not in dict(value_dict):
                        value_dict[headers[index]] = []
                    value_dict[headers[index]].append(row[index])

    # At this point all dictionary leaves are lists, not scalars.
    # For each dict leaf, convert the list of values to its mean.
    recursive_mean(data_dict)

    if not os.path.exists(run["output_dir"]):
        os.makedirs(run["output_dir"])

    for key in data_dict.keys():
        # Generate 6-digit hash for each AOI to be used in permalinks.
        sha_1 = hashlib.sha1()
        sha_1.update(key.encode("utf-8"))
        hashed_placename = sha_1.hexdigest()[:6]
        hash_map[hashed_placename] = key
        filename = hashed_placename + ".json"
        path = run["output_dir"] + "/" + filename

        with open(path, "w") as jsonfile:
            json.dump(dict(data_dict[key]), jsonfile, indent=4)

with open(hash_map_path, "w") as hashfile:
    json.dump(hash_map, hashfile, indent=4)

#!/bin/bash

pipenv run ./csv2json.py input/Fish_Growth_by_AOI.csv ../assets/fish_growth.json
pipenv run ./csv2json.py input/Hydrograph_Data_by_AOI.csv ../assets/hydrograph_data.json
pipenv run ./csv2json.py input/Hydrology_Stats_by_AOI.csv ../assets/hydrology_stats.json
pipenv run ./csv2json.py input/Riparian_Fire_Impact_by_AOI.csv ../assets/riparian_fire_impact.json
pipenv run ./csv2json.py input/Stream_Temp_Stats_by_AOI.csv ../assets/stream_temp_stats.json

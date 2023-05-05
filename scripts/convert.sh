#!/bin/bash

pipenv run ./csv2json.py input/Fish_Growth_by_AOI.csv ../assets/data/fish_growth
pipenv run ./csv2json.py input/Hydrograph_Data_by_AOI.csv ../assets/data/hydrograph_data
pipenv run ./csv2json.py input/Hydrology_Stats_by_AOI.csv ../assets/data/hydrology_stats
pipenv run ./csv2json.py input/Riparian_Fire_Impact_by_AOI.csv ../assets/data/riparian_fire_impact
pipenv run ./csv2json.py input/Stream_Temp_Stats_by_AOI.csv ../assets/data/stream_temp_stats

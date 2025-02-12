import pandas as pd
import numpy as np

data= pd.read_csv('raw/cats_predation.csv', sep=',')

data[['Year', 'Month']] = data['Year:Month'].str.split(':', expand=True)

# to avoid duplicates
data = data.drop(columns=['Year:Month'])


cleaned_csv_file_path = 'clean/cleaned_cats_predation.csv'

data.to_csv(cleaned_csv_file_path, index=False)
import pandas as pd
import numpy as np

data= pd.read_csv('clean/cleaned_cats_predation.csv', sep=',')

print(data.columns)

birds_data = data[data['PreyTaxon'] == 'Birds']

cleaned_csv_file_path = 'clean/cats_predation_birds.csv'

birds_data.to_csv(cleaned_csv_file_path, index=False)
import pandas as pd

# path to csv
csv_file_path = 'data/raw/birds_index.csv'

data= pd.read_csv(csv_file_path, sep=';')

data_cleaned = data[data['nameE'] == 'Tree Pipit'].drop(columns=['ArtId', 'SE', 'nameF', 'nameI',])

# path to store new file (was in a venv python repo not this one)
cleaned_csv_file_path = 'data/clean/birds_index_tree_pipit.csv'

# Save the cleaned data
data_cleaned.to_csv(cleaned_csv_file_path, index=False)
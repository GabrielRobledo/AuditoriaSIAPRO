import MySQLdb
import pandas as pd
import numpy as np

#Insercion de OMES
df = pd.read_excel('Pami Agosto-24BAJAR.xlsm', sheet_name='Detalle_Practicas')

print(df.iloc[1, 1])
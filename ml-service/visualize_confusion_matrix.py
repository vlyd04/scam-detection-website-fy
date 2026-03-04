import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Confusion matrix data
cm = np.array([[288, 12],
               [17, 283]])

# Labels
labels = ['Legit', 'Scam']

# Create heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=labels, yticklabels=labels,
            cbar_kws={'label': 'Count'})

# Labels and title
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix Heatmap')

# Save the plot
plt.savefig('confusion_matrix_heatmap.png', dpi=300, bbox_inches='tight')

# Display the plot (commented out for terminal execution)
# plt.show()
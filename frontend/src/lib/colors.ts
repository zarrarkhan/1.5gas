export const LEGEND_COLORS = {
  // Define buckets with a value (upper limit of the bucket), color, and a descriptive label
  buckets: [
    { value: -1, color: '#001524', label: '< 0%' }, // For negative values or values less than 0
    { value: 10, color: '#15616d', label: '0% - 10%' },
    { value: 40, color: '#ffecd1', label: '10% - 40%' },
    { value: 70, color: '#ff7d00', label: '40% - 70%' },
    { value: 999, color: '#78290f', label: '> 70%' } // Use a very high value for the last bucket's upper limit
  ],
  noDataColor: '#333333'
};
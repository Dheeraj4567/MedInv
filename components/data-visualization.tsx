"use client"

interface DataVisualizationProps {
  data: {
    labels: string[];
    values: number[];
  };
}

// Simplified component that doesn't display any content
const DataVisualizationModule = ({ data }: DataVisualizationProps) => {
  return null;
};

export default DataVisualizationModule;


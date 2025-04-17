import { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Component to ensure Chart.js is properly configured globally
const ChartConfigurator = () => {
  useEffect(() => {
    // Register all required components for Chart.js
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      ArcElement,
      Title,
      Tooltip,
      Legend,
      Filler
    );

    // Set global defaults
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
    
    // Clean up on unmount
    return () => {
      // Unregister to prevent memory leaks
      ChartJS.unregister(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        ArcElement,
        Title,
        Tooltip,
        Legend,
        Filler
      );
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default ChartConfigurator; 
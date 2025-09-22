import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../../../services/realtimeApi';
import '../../../styles/pages/doctor/DoctorReviews.css';

const DoctorReviews = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    sortBy: 'newest',
    ratingFilter: 'all'
  });

  useEffect(() => {
    const fetchDoctorReviews = async () => {
      setLoading(true);
      try {
        const reviewsData = await reviewsApi.getDoctorReviews(doctorId);
        setReviews(reviewsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching doctor reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorReviews();
      const interval = setInterval(fetchDoctorReviews, 20000);
      return () => clearInterval(interval);
    }
  }, [doctorId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getSortedAndFilteredReviews = () => {
    // First filter by rating
    let filteredReviews = [...reviews];
    
    if (filterOptions.ratingFilter !== 'all') {
      const ratingValue = parseInt(filterOptions.ratingFilter);
      filteredReviews = filteredReviews.filter(review => review.rating === ratingValue);
    }
    
    // Then sort
    return filteredReviews.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      
      if (filterOptions.sortBy === 'newest') {
        return dateB - dateA;
      } else if (filterOptions.sortBy === 'oldest') {
        return dateA - dateB;
      } else if (filterOptions.sortBy === 'highest') {
        return b.rating - a.rating;
      } else if (filterOptions.sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`fa${i <= rating ? 's' : 'r'} fa-star`} 
          style={{ color: i <= rating ? '#FFD700' : '#ccc' }}
        ></i>
      );
    }
    return stars;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    
    return distribution;
  };

  const renderRatingDistribution = () => {
    const distribution = getRatingDistribution();
    const totalReviews = reviews.length;
    
    return Object.entries(distribution)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // Sort from 5 to 1
      .map(([rating, count]) => {
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        
        return (
          <div className="rating-distribution-item" key={rating}>
            <div className="rating-label">{rating} {rating === '1' ? 'Star' : 'Stars'}</div>
            <div className="rating-bar-container">
              <div 
                className="rating-bar" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="rating-count">{count}</div>
          </div>
        );
      });
  };

  if (loading) {
    return <div className="loading-reviews">Loading reviews...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const sortedAndFilteredReviews = getSortedAndFilteredReviews();

  return (
    <div className="doctor-reviews-container">
      <div className="reviews-header">
        <h2>Patient Feedback & Reviews</h2>
        <div className="rating-summary">
          <div className="average-rating">
            <div className="rating-number">{getAverageRating()}</div>
            <div className="rating-stars">{renderStars(Math.round(getAverageRating()))}</div>
            <div className="total-reviews">Based on {reviews.length} reviews</div>
          </div>
          
          <div className="rating-distribution">
            {renderRatingDistribution()}
          </div>
        </div>
      </div>
      
      <div className="reviews-filters">
        <div className="filter-group">
          <label htmlFor="sortBy">Sort by:</label>
          <select 
            id="sortBy" 
            name="sortBy" 
            value={filterOptions.sortBy} 
            onChange={handleFilterChange}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="ratingFilter">Filter by rating:</label>
          <select 
            id="ratingFilter" 
            name="ratingFilter" 
            value={filterOptions.ratingFilter} 
            onChange={handleFilterChange}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>
      
      {sortedAndFilteredReviews.length > 0 ? (
        <div className="reviews-list">
          {sortedAndFilteredReviews.map(review => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <div className="review-meta">
                  <div className="reviewer">
                    {review.isAnonymous || review.anonymous ? (
                      <span className="anonymous-reviewer">Anonymous Patient</span>
                    ) : (
                      <span className="patient-name">Patient</span>
                    )}
                    <span className="review-date">
                      {new Date(review.createdAt || review.date).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>
              <div className="review-content">
                <p>{review.review || review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-reviews">
          <i className="fas fa-comment-slash"></i>
          <h3>No reviews found</h3>
          <p>{filterOptions.ratingFilter !== 'all' 
            ? `No ${filterOptions.ratingFilter}-star reviews have been submitted yet.` 
            : 'No reviews have been submitted by patients yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorReviews; 
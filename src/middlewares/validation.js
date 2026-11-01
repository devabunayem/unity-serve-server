const ALLOWED_EVENT_TYPES = [
  'Cleanup',
  'Plantation',
  'Donation',
  'Winter Aid',
  'Blood Donation',
  'Food Drive',
  'Education & Literacy',
  'Healthcare & Medical',
  'Other Social Work'
];

function validateEventPayload(req, res, next) {
  const { title, description, eventType, thumbnail, location, eventDate } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Event title is required and must be at least 3 characters long.');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Event description is required and must be at least 10 characters long.');
  }

  if (!eventType || typeof eventType !== 'string' || !ALLOWED_EVENT_TYPES.includes(eventType.trim())) {
    errors.push(`Event type must be one of: ${ALLOWED_EVENT_TYPES.join(', ')}`);
  }

  if (!thumbnail || typeof thumbnail !== 'string' || !thumbnail.startsWith('http')) {
    errors.push('A valid thumbnail image URL (starting with http:// or https://) is required.');
  }

  if (!location || typeof location !== 'string' || location.trim().length < 3) {
    errors.push('Event location is required and must be at least 3 characters long.');
  }

  if (!eventDate) {
    errors.push('Event date is required.');
  } else {
    const selectedDate = new Date(eventDate);
    const currentDate = new Date();

    if (isNaN(selectedDate.getTime())) {
      errors.push('Invalid date format provided.');
    } else if (selectedDate <= currentDate) {
      errors.push('Event date must be in the future. Past dates are not allowed.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

module.exports = {
  ALLOWED_EVENT_TYPES,
  validateEventPayload,
};

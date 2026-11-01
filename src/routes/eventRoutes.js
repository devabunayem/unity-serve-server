const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

const { getCollections } = require('../config/db');
const { verifyJWT } = require('../middlewares/auth');
const { validateEventPayload } = require('../middlewares/validation');

function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

router.get('/upcoming', async (req, res) => {
  try {
    const { eventsCollection } = getCollections();
    const { limit, search, eventType } = req.query;

    const todayStr = getTodayDateString();

    const query = {
      $or: [
        { eventDate: { $gte: todayStr } },
        { eventDate: { $gte: new Date(todayStr) } },
      ],
    };

    if (eventType && eventType !== 'All') {
      query.eventType = eventType;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        {
          $or: [
            { title: searchRegex },
            { location: searchRegex },
            { description: searchRegex },
          ],
        },
      ];
    }

    let cursor = eventsCollection.find(query).sort({ eventDate: 1 });

    if (limit && !isNaN(parseInt(limit, 10))) {
      cursor = cursor.limit(parseInt(limit, 10));
    }

    const events = await cursor.toArray();

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events.',
    });
  }
});

router.get('/user/my-events', verifyJWT, async (req, res) => {
  try {
    const { eventsCollection } = getCollections();
    const userEmail = req.user.email;

    const myEvents = await eventsCollection
      .find({ creatorEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: myEvents.length,
      events: myEvents,
    });
  } catch (error) {
    console.error('Error fetching my events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your created events.',
    });
  }
});

router.get('/user/my-joined', verifyJWT, async (req, res) => {
  try {
    const { joinedEventsCollection } = getCollections();
    const userEmail = req.user.email;

    const joinedEvents = await joinedEventsCollection
      .find({ userEmail })
      .sort({ eventDate: 1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: joinedEvents.length,
      events: joinedEvents,
    });
  } catch (error) {
    console.error('Error fetching joined events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your joined events.',
    });
  }
});

router.get('/:id/is-joined', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    const { joinedEventsCollection } = getCollections();

    const existingJoin = await joinedEventsCollection.findOne({
      eventId: id,
      userEmail,
    });

    return res.status(200).json({
      success: true,
      isJoined: !!existingJoin,
    });
  } catch (error) {
    console.error('Error checking join status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check join status.',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format.',
      });
    }

    const { eventsCollection, joinedEventsCollection } = getCollections();

    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const participantsCount = await joinedEventsCollection.countDocuments({
      eventId: id,
    });

    return res.status(200).json({
      success: true,
      event: {
        ...event,
        participantsCount,
      },
    });
  } catch (error) {
    console.error('Error fetching event by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event details.',
    });
  }
});

router.post('/', verifyJWT, validateEventPayload, async (req, res) => {
  try {
    const { title, description, eventType, thumbnail, location, eventDate } = req.body;
    const { eventsCollection } = getCollections();

    const newEvent = {
      title: title.trim(),
      description: description.trim(),
      eventType: eventType.trim(),
      thumbnail: thumbnail.trim(),
      location: location.trim(),
      eventDate: eventDate.trim(),
      creatorEmail: req.user.email,
      creatorName: req.user.name || req.user.email.split('@')[0],
      creatorPhoto: req.user.photoURL || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await eventsCollection.insertOne(newEvent);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      eventId: result.insertedId,
      event: { ...newEvent, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event.',
    });
  }
});

router.put('/:id', verifyJWT, validateEventPayload, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format.',
      });
    }

    const { eventsCollection, joinedEventsCollection } = getCollections();
    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.creatorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update events created by you.',
      });
    }

    const { title, description, eventType, thumbnail, location, eventDate } = req.body;

    const updatedData = {
      title: title.trim(),
      description: description.trim(),
      eventType: eventType.trim(),
      thumbnail: thumbnail.trim(),
      location: location.trim(),
      eventDate: eventDate.trim(),
      updatedAt: new Date(),
    };

    await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    await joinedEventsCollection.updateMany(
      { eventId: id },
      {
        $set: {
          eventTitle: updatedData.title,
          eventLocation: updatedData.location,
          eventDate: updatedData.eventDate,
          eventThumbnail: updatedData.thumbnail,
          eventType: updatedData.eventType,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      event: { ...event, ...updatedData },
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update event.',
    });
  }
});

router.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format.',
      });
    }

    const { eventsCollection, joinedEventsCollection } = getCollections();
    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.creatorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete events created by you.',
      });
    }

    await eventsCollection.deleteOne({ _id: new ObjectId(id) });
    await joinedEventsCollection.deleteMany({ eventId: id });

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete event.',
    });
  }
});

router.post('/:id/join', verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format.',
      });
    }

    const { eventsCollection, joinedEventsCollection } = getCollections();
    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const todayStr = getTodayDateString();
    if (event.eventDate < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Cannot join an event whose date has already passed.',
      });
    }

    const userEmail = req.user.email;

    const alreadyJoined = await joinedEventsCollection.findOne({
      eventId: id,
      userEmail,
    });

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this event.',
      });
    }

    const joinRecord = {
      eventId: id,
      eventTitle: event.title,
      eventLocation: event.location,
      eventDate: event.eventDate,
      eventThumbnail: event.thumbnail,
      eventType: event.eventType,
      creatorEmail: event.creatorEmail,
      userEmail,
      userName: req.user.name || userEmail.split('@')[0],
      userPhoto: req.user.photoURL || '',
      joinedAt: new Date(),
    };

    const result = await joinedEventsCollection.insertOne(joinRecord);

    return res.status(201).json({
      success: true,
      message: 'You have successfully joined the event! Thank you for your service.',
      joinedId: result.insertedId,
      joinRecord,
    });
  } catch (error) {
    console.error('Error joining event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join event.',
    });
  }
});

module.exports = router;

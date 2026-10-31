const express = require('express');
const router = express.Router();
const { getCollections } = require('../config/db');
const { createToken, verifyJWT } = require('../middlewares/auth');

router.post('/jwt', async (req, res) => {
  try {
    const { email, name, photoURL } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid email is required to issue a token.',
      });
    }

    const { usersCollection } = getCollections();

    const userDoc = {
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0],
      photoURL: photoURL || '',
      updatedAt: new Date(),
    };

    await usersCollection.updateOne(
      { email: userDoc.email },
      {
        $set: userDoc,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    const tokenPayload = {
      email: userDoc.email,
      name: userDoc.name,
      photoURL: userDoc.photoURL,
    };

    const token = createToken(tokenPayload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: tokenPayload,
    });
  } catch (error) {
    console.error('Error creating auth token:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating auth session.',
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

router.get('/me', verifyJWT, async (req, res) => {
  try {
    const { usersCollection } = getCollections();
    const user = await usersCollection.findOne({ email: req.user.email });

    return res.status(200).json({
      success: true,
      user: user || req.user,
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
    });
  }
});

router.put('/profile', verifyJWT, async (req, res) => {
  try {
    const { name, photoURL } = req.body;
    const email = req.user.email;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.',
      });
    }

    const { usersCollection } = getCollections();

    const updateFields = {
      name: name.trim(),
      updatedAt: new Date(),
    };

    if (photoURL && typeof photoURL === 'string') {
      updateFields.photoURL = photoURL.trim();
    }

    await usersCollection.updateOne(
      { email },
      { $set: updateFields }
    );

    const updatedUser = await usersCollection.findOne({ email });

    const newTokenPayload = {
      email: updatedUser.email,
      name: updatedUser.name,
      photoURL: updatedUser.photoURL,
    };

    const token = createToken(newTokenPayload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
});

module.exports = router;

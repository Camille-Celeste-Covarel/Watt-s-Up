import type { RequestHandler } from "express";

// Import access to data
import { User } from "../../models/user.model"

// The B of BREAD - Browse (Read All) operation
const browse: RequestHandler = async (req, res, next) => {
  try {
    // Fetch all items
    const items = await User.findAll();

    // Respond with the items in JSON format
    res.json(items);
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// The R of BREAD - Read operation
const read: RequestHandler = async (req, res, next) => {
  try {
    // Fetch a specific item based on the provided ID
    const itemId = Number(req.params.id);
    const item = await User.findOne({where: {id: itemId}});

    // If the item is not found, respond with HTTP 404 (Not Found)
    // Otherwise, respond with the item in JSON format
    if (item == null) {
      res.sendStatus(404);
    } else {
      res.json(item);
    }
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// The A of BREAD - Add (Create) operation
const add: RequestHandler = async (req, res, next) => {
  try {

    // Create the item
    const insertId = await User.findOrCreate({defaults: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        password: 'securepassword123',
        birthdate: new Date('1990-01-01'),
        address: '123 Main St',
        city: 'Anytown',
        postcode: '12345',
        country: 'FR',
        isAdmin: false,
      },});

    // Respond with HTTP 201 (Created) and the ID of the newly inserted item
    res.status(201).json({ insertId });
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

export default { browse, read, add };

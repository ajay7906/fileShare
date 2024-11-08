// controllers/device.controller.js
const User = require('../model/User');
const Request = require('../model/Request');

exports.getOnlineDevices = async (req, res) => {
  try {
    const devices = await User.find({ 
      isOnline: true, 
      _id: { $ne: req.user.id } 
    }, '-password');
    
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching devices', error: error.message });
  }
};




exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    
    const request = new Request({
      sender: req.user.id,
      receiver: receiverId,
    });
    
    await request.save();
    
    // Emit socket event for real-time notification
    req.app.get('io').to(receiverId).emit('new_request', request);
    
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error sending request', error: error.message });
  }
};


exports.acceptRequest = async (req, res) => {
    try {
      const requestId = req.params.requestId;
  
      // Find and update the request status
      const request = await Request.findById(requestId);
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      // Verify the request receiver is the logged-in user
      if (request.receiver.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to accept this request' });
      }
  
      // Check if request is already accepted
      if (request.status === 'accepted') {
        return res.status(400).json({ message: 'Request already accepted' });
      }
  
      // Update request status to accepted
      request.status = 'accepted';
      request.acceptedAt = Date.now();
      await request.save();
  
      // Create connection/friendship between users
      const connection = new Connection({
        users: [request.sender, request.receiver],
        status: 'active',
        createdAt: Date.now()
      });
      await connection.save();
  
      // Emit socket event for real-time notification
      req.app.get('io').to(request.sender.toString()).emit('request_accepted', {
        request,
        connection
      });
  
      // Return success response with updated request and new connection
      res.status(200).json({
        message: 'Request accepted successfully',
        request,
        connection
      });
  
    } catch (error) {
      console.error('Error accepting request:', error);
      res.status(500).json({ 
        message: 'Error accepting request', 
        error: error.message 
      });
    }
  };
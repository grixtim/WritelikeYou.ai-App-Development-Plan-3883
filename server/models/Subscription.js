import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  planType: {
    type: String,
    enum: ['monthly', 'annual'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'incomplete'],
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  priceId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  canceledAt: {
    type: Date,
    default: null
  },
  cancelReason: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    default: null
  },
  invoices: [{
    invoiceId: String,
    amount: Number,
    status: String,
    date: Date,
    paidAt: Date,
    url: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes for performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1, status: 1 });

// Static method to find active subscription for a user
subscriptionSchema.statics.findActiveForUser = function(userId) {
  return this.findOne({
    userId,
    status: { $in: ['active', 'past_due'] }
  }).sort({ currentPeriodEnd: -1 });
};

// Static method to calculate MRR (Monthly Recurring Revenue)
subscriptionSchema.statics.calculateMRR = async function() {
  const result = await this.aggregate([
    {
      $match: {
        status: 'active'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $group: {
        _id: '$planType',
        count: { $sum: 1 },
        totalAmount: {
          $sum: {
            $cond: [
              { $eq: ['$planType', 'annual'] },
              { $divide: [{ $arrayElemAt: ['$invoices.amount', 0] }, 12] }, // Divide annual by 12
              { $arrayElemAt: ['$invoices.amount', 0] } // Monthly as is
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        plans: {
          $push: {
            type: '$_id',
            count: '$count',
            amount: '$totalAmount'
          }
        },
        totalMRR: { $sum: '$totalAmount' },
        totalSubscriptions: { $sum: '$count' }
      }
    }
  ]);
  
  return result.length ? result[0] : { totalMRR: 0, totalSubscriptions: 0, plans: [] };
};

// Static method to calculate churn rate
subscriptionSchema.statics.calculateChurnRate = async function(period = 30) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - period);
  
  const activeAtStart = await this.countDocuments({
    status: 'active',
    createdAt: { $lt: startDate }
  });
  
  const canceledInPeriod = await this.countDocuments({
    status: 'canceled',
    canceledAt: { $gte: startDate, $lte: now },
    createdAt: { $lt: startDate }
  });
  
  return {
    activeAtStart,
    canceledInPeriod,
    churnRate: activeAtStart > 0 ? (canceledInPeriod / activeAtStart) * 100 : 0
  };
};

// Static method to get subscriptions expiring soon
subscriptionSchema.statics.getExpiringSubscriptions = function(daysAhead = 7) {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: { $gte: now, $lte: futureDate },
    cancelAtPeriodEnd: true
  }).populate('userId', 'email');
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
import express from 'express';
import {MongoClient} from 'mongodb';
import path from 'path';
//user pw:6avNQhrBocg0sh9x

async function start() {
  const dbUrl = `mongodb+srv://olivierdejonge:6avNQhrBocg0sh9x@mongodata.cuj55fi.mongodb.net/?retryWrites=true&w=majority`
  const client = new MongoClient(dbUrl);

  await client.connect();
  const db = client.db('fsv-db');

  const app = express();
  app.use(express.json());
  app.use('/images', express.static(path.join(__dirname, "/assets")));

  app.use(express.static( 
    path.resolve(__dirname, '../dist'),
    { maxAge: '1y', etag: false  },
  ))

  app.get('/api/products', async (req, res) => {
    const products = await db.collection('products').find({}).toArray();
    res.send(products);
  })
  
  async function populateCartIds(ids) {
    await client.connect();
    const db = client.db('fsv-db');
    return Promise.all(ids.map(id => db.collection('products').findOne({ id })));
  }
  
  app.get('/api/users/:userId/cart', async (req, res) => {
    await client.connect();
    const db = client.db('fsv-db')
    const user = await db.collection('users').findOne({id: req.params.userId});
    const populatedCart = await populateCartIds(user?.cartItems || []);
    res.json(populatedCart);
  });
  
  app.post('/api/users/:userId/cart', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.body.id;

    const existingUser = await db.collection('users').findOne({ id: userId});
    if(!existingUser) {
      await db.collection('users').insertOne({id: userId, cartItems: []})
    }

    await db.collection('users').updateOne({id: userId}, {
      $addToSet: {cartItems: productId}
    })
    const user = await db.collection('users').findOne({id: userId});
    const populatedCart = await populateCartIds(user?.cartItems || []);
    res.json(populatedCart);
  })
  
  app.get('/api/products/:productId', async (req, res) => {
    const productId = req.params.productId;
    const product = await db.collection('products').findOne({ id: productId });
    res.json(product);
  })
  
  app.delete('/api/users/:userId/cart/:productId', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    await db.collection('users').updateOne({id: userId}, {
      $pull: {cartItems: productId}
    });

    const user = await db.collection('users').findOne({id: userId});
    const populatedCart = await populateCartIds(user?.cartItems || []);
    res.json(populatedCart);
  })

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  const port = process.env.PORT || 8000;
  
  app.listen (8000, () => {
    console.log('Server is running on port ' + port)
  });
}

start()

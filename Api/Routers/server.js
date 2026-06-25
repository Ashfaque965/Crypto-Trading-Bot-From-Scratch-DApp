const userRouter = require('./Routers/userRouter');

// ... regular express middleware initializations (app.use(express.json()))

// Mount the user endpoint router logic
app.use('/api/v1/users', userRouter);
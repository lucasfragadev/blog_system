import { Router } from 'express'; // Import Router from Express.
import { welcomeController } from '../controllers/welcomeController'; // Import controller.

const router = Router(); // Creates a router instance.

router.get('/', welcomeController.getWelcomeMessage);

export default router;
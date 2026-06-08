import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/availability", auth, bookingController.getAvailability);
router.post("/book", auth, bookingController.createBooking);
router.get("/my-bookings", auth, bookingController.getMyBookings);
router.delete("/:bookingId", auth, bookingController.cancelBooking);

export const bookingRouter = router;

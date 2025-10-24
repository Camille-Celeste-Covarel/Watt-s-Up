import { Router } from "express";
import bookActions from "../modules/bookActions";

const router = Router();

router.get("/", bookActions.browse);
router.get("/:id", bookActions.read);
router.post("/", bookActions.add);
router.put("/:id", bookActions.edit);
router.delete("/:id", bookActions.destroy);

export default router;

import { BaseRoutes } from "./BaseRoutes";

/**
 * Utility class for health endpoints; no controllers, unnecessary
 */
export class HealthRoutes extends BaseRoutes {
    constructor() {
        super();

        this.router.get("/", (req, res) => {
            res.status(200).json({
                ok: true,
            });
        })

        this.router.post("/", (req, res) => {
            res.status(200).json({
                ok: true,
            });
        });
    }
}

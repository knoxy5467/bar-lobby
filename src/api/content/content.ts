import * as path from "path";
import { AbstractContentAPI } from "@/api/content/abstract-content";
import { MapContentAPI } from "@/api/content/map-content";
import { EngineContentAPI } from "@/api/content/engine-content";
import { GameContentAPI } from "@/api/content/game-content";
import { lastInArray } from "jaz-ts-utils";

export class ContentAPI extends AbstractContentAPI {
    public engine: EngineContentAPI;
    public game: GameContentAPI;
    public maps: MapContentAPI;

    constructor(userDataDir: string, dataDir: string) {
        super(userDataDir, dataDir);

        this.engine = new EngineContentAPI(userDataDir, dataDir);
        this.game = new GameContentAPI(userDataDir, dataDir);
        this.maps = new MapContentAPI(userDataDir, dataDir);
    }

    public async init() {
        await this.engine.init();

        const latestEngine = lastInArray(this.engine.installedVersions);
        const binaryName = process.platform === "win32" ? "pr-downloader.exe" : "pr-downloader";
        const prBinaryPath = path.join(this.dataDir, "engine", latestEngine, binaryName);

        await this.game.init(prBinaryPath);

        await this.maps.init();

        return this;
    }
}
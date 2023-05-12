import { injectable } from "inversify";

@injectable()
export class Paths {

    private _source: string;
    private _destination: string;
    private _temp: string;
    private _addons: string;

    public setup(source: string, destination: string, temp: string, addons: string): void {
        this._source = source;
        this._destination = destination;
        this._temp = temp;
        this._addons = addons;
    }

    public transform(path: string): string {
        return (
            path.replace("${Source}", this._source)
                .replace("${Temp}", this._temp)
                .replace("${Destination}", this._destination)
                .replace("${Addons}", this._addons)
        );
    }
}
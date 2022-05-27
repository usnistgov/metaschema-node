import MarkupLine from "./datatype/markup/markupLine";
import MarkupMultiLine from "./datatype/markup/markupMultiLine";

export default abstract class AbstractMetaschema {
    abstract getLocation(): string | undefined;

    abstract getName(): MarkupLine;

    abstract getVersion(): string;

    abstract getRemarks(): MarkupMultiLine | undefined;

    abstract getShortName(): string;

    abstract getXmlNamespace(): string;

    abstract getJsonBaseUri(): string;

    abstract getImportedMetaschemas(): AbstractMetaschema[];

    abstract getImportedMetaschemasByShortName(name: string): AbstractMetaschema | undefined;
}
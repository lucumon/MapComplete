import {LayerDefinition} from "../LayerDefinition";
import {And, Regex, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRenderingOptions";

export class GrbToFix extends LayerDefinition {

    constructor() {
        super("grb");

        this.name = "grb";
        this.presets = [];
        this.icon = "./assets/star.svg";
        this.overpassFilter = new Regex("fixme", "GRB");
        this.minzoom = 13;



        this.style = function (tags) {
            return {
                icon: {
                    iconUrl: "assets/star.svg",
                    iconSize: [40, 40],
                },
                color: "#ff0000"
            };

        }

        this.title = new TagRenderingOptions({
            freeform: {
                key: "addr:street",
                renderTemplate: "{addr:street} <b>{addr:housenumber}</b>",
                template: "Fixme $$$"
            },
            mappings: [
                {
                    k: new Tag("fixme","*"),
                    txt: "{fixme}"
                }
            ]
        })

        this.elementsToShow = [

            new TagRenderingOptions(
                {
                    freeform: {
                        key: "addr:housenumber",
                        renderTemplate: "Het adres is {addr:street} <b>{addr:housenumber}</b>",
                        template: "Straat? $$$",
                    },
                    question: "Wat is het huisnummer?"
                }
            ),

            new TagRenderingOptions({

                question: "Wat is het huisnummer?",
                tagsPreprocessor: tags => {
                    const telltale = "GRB thinks that this has number ";
                    const index = tags.fixme.indexOf(telltale);
                    if (index >= 0) {
                        const housenumber = tags.fixme.slice(index + telltale.length);
                        tags["grb:housenumber:human"] = housenumber;
                        tags["grb:housenumber"] = housenumber == "no number" ? "" : housenumber;
                    }
                },
                freeform: {
                    key: "addr:housenumber",
                    template: "Het huisnummer is $$$",
                    renderTemplate: "Het adres is {addr:street} <b>{addr:housenumber}</b>, GRB denkt <i>{grb:housenumber:human}</i>",
                    extraTags: new And([new Tag("fixme", ""), new Tag("not:addr:housenumber", "")])
                },
                mappings: [
                    {
                        k: new And([new Tag("addr:housenumber", "{grb:housenumber}"), new Tag("fixme", ""), new Tag("not:addr:housenumber", "")]),
                        txt: "Volg GRB: <b>{grb:housenumber:human}</b>",
                        substitute: true
                    },
                    {
                        k: new And([new Tag("addr:housenumber", "{addr:housenumber}"), new Tag("fixme", ""), new Tag("not:addr:housenumber", "")]),
                        txt: "Volg OSM: <b>{addr:housenumber}</b>",
                        substitute: true
                    },
                    {
                        k: new And([new Tag("building", "garage"),
                            new Tag("not:addr:housenumber", "yes"),
                            new Tag("addr:housenumber", ""), new Tag("fixme", "")]),
                        txt: "Dit is een garage(poort) zonder nummer",
                        substitute: true
                    },
                    {
                        k: new And([
                            new Tag("not:addr:housenumber", "yes"),
                            new Tag("addr:housenumber", ""), new Tag("fixme", "")]),
                        txt: "Gewoon een huis zonder nummer",
                        substitute: true
                    },

                ]
            }).OnlyShowIf(new Tag("fixme", "*"))


        ];
    }


}
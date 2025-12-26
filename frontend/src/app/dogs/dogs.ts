import {Component, OnInit, signal} from "@angular/core";
import {Apollo} from "apollo-angular";
import {Dog} from "../graphql/types";
import {OwnersService} from "../service/owners.service";
import {CREATE_DOG_MUTATION} from "../graphql/dogs.graphql";

@Component({
    selector: 'app-dogs',
    imports: [],
    template: `
        <input #dogNameInput type="text" placeholder="Dog's name" maxlength="35">
        <input #dogAgeInput type="number" placeholder="0" maxlength="2">
        <select #dogOwnerSelect>
            <option value="" disabled selected>Select owner</option>
            @if (owners() && owners().length > 0) {
                @for (owner of owners(); track owner.id) {
                    <option value="{{ owner.id }}">{{ owner.name }}</option>
                }
            }
        </select>

        <button id="addDogButton" (click)="addDog(dogNameInput.value, Number(dogAgeInput.value), Number(dogOwnerSelect.value))">Add Dog</button>
        <span id="updatedOwnerMoneyResult" [hidden]="createdDog() === null">Created dog {{ createdDog()?.name }} with age: {{ createdDog()?.age }} years</span>
    `,
    styleUrl: './dogs.css'
})

export class Dogs implements OnInit {
    owners = this.ownersService.owners;
    createdDog = signal<Dog | null>(null)

    constructor(private ownersService: OwnersService,
                private apollo: Apollo) {}

    ngOnInit() {
        this.ownersService.loadOwners();
    }

    addDog(name: string, age: number, ownerId: number) {
        this.apollo.mutate({
            mutation: CREATE_DOG_MUTATION,
            variables: { name, age, ownerId }
        }).subscribe(({ data }: any) =>
            this.createdDog.set(data?.createDog ?? null)
        );
    }

    protected readonly Number = Number;
}

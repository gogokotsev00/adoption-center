import {Component, OnInit, signal} from "@angular/core";
import {Dog} from "../graphql/types";
import {OwnersService} from "../service/owners.service";
import {DogsService} from "../service/dogs.service";

@Component({
    selector: 'app-dogs',
    imports: [],
    template: `
        <div class="dogs-container">
            <div class="dog-action-container">
                <div class="dog-inputs">
                    <input #dogNameInput type="text" placeholder="Dog's name" maxlength="35" pattern="[a-zA-Z\\s]+">
                    <input #dogAgeInput type="number" placeholder="0" min="0" max="99">
                    <select #dogOwnerSelect>
                        <option value="" disabled selected>Select owner</option>
                        @if (owners() && owners().length > 0) {
                            @for (owner of owners(); track owner.id) {
                                <option value="{{ owner.id }}">{{ owner.name }}</option>
                            }
                        }
                    </select>

                    <button id="addDogButton" (click)="addDog(dogNameInput.value, Number(dogAgeInput.value), dogOwnerSelect.value)">Add Dog</button>
                    <button class="clear-btn" (click)="clearAddDogMode(dogNameInput, dogAgeInput, dogOwnerSelect)">Clear</button>
                </div>

                <div class="result-message-container">
                    @if (validationError()) {
                        <span class="result-message validation-error">{{ validationError() }}</span>
                    } @else if (createdDog() !== null) {
                        <span id="createdDogResult" class="result-message">Created dog {{ createdDog()?.name }} with age: {{ createdDog()?.age }} years</span>
                    }
                </div>
            </div>

            @if (loading()) {
                <div class="status-message">Loading...</div>
            }
            @if (error()) {
                <div class="status-message error">
                    <p>Error :(</p>
                    <p>{{ error().message }}</p>
                </div>
            }

            <div class="table-container">
                <table class="dogs-grid">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (dog of dogs(); track dog.id) {
                            <tr>
                                <td>{{ dog.id }}</td>
                                <td>{{ dog.name }}</td>
                                <td>{{ dog.age }}</td>
                                <td>{{ dog.owner?.name ?? 'None' }}</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `,
    styleUrl: './dogs.css'
})

export class Dogs implements OnInit {
    owners = this.ownersService.owners;
    dogs = this.dogsService.dogs;
    loading = this.dogsService.loading;
    error = this.dogsService.error;
    createdDog = signal<Dog | null>(null);
    validationError = signal<string | null>(null);

    constructor(private ownersService: OwnersService,
                private dogsService: DogsService) {
    }

    ngOnInit() {
        this.ownersService.loadOwners();
        this.dogsService.loadDogs();
    }

    addDog(name: string, age: number, ownerId: string) {
        this.clearResults();
        if (!name || !/^[a-zA-Z\s]+$/.test(name.trim())) {
            this.validationError.set("Dog's name must contain only letters!");
            return;
        }
        if (isNaN(age) || age < 0) {
            this.validationError.set("Age must be non-negative!");
            return;
        }
        if (!ownerId) {
            this.validationError.set("Please select an owner!");
            return;
        }
        this.dogsService
            .addDog(name.trim(), age, ownerId)
            .subscribe(({data}: any) => {
                this.createdDog.set(data?.createDog ?? null);
                this.dogsService.loadDogs();
            });
    }

    clearAddDogMode(nameInput: HTMLInputElement, ageInput: HTMLInputElement, ownerSelect: HTMLSelectElement) {
        nameInput.value = '';
        ageInput.value = '';
        ownerSelect.value = '';
        this.clearResults();
    }

    clearResults() {
        this.createdDog.set(null);
        this.validationError.set(null);
    }

    protected readonly Number = Number;
}

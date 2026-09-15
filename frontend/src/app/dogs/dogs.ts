import {Component, computed, OnInit, signal} from "@angular/core";
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
                    <input #dogNameInput type="text" placeholder="Dog's name" maxlength="35" pattern="[a-zA-Z\\s]+" required>
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
                            <th class="sortable" (click)="toggleSort('id')">
                                ID {{ sortColumn() === 'id' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                            </th>
                            <th class="sortable" (click)="toggleSort('name')">
                                Name {{ sortColumn() === 'name' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                            </th>
                            <th class="sortable" (click)="toggleSort('age')">
                                Age {{ sortColumn() === 'age' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                            </th>
                            <th class="sortable" (click)="toggleSort('owner')">
                                Owner {{ sortColumn() === 'owner' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (dog of sortedDogs(); track dog.id) {
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

    sortColumn = signal<'id' | 'name' | 'age' | 'owner'>('id');
    sortDirection = signal<'asc' | 'desc'>('asc');

    sortedDogs = computed(() => {
        const col = this.sortColumn();
        const dir = this.sortDirection();
        const factor = dir === 'asc' ? 1 : -1;
        return [...this.dogsService.dogs()].sort((a, b) => {
            if (col === 'id') {
                return factor * (Number(a.id) - Number(b.id));
            } else if (col === 'age') {
                return factor * ((a.age ?? 0) - (b.age ?? 0));
            } else if (col === 'owner') {
                const ownerA = a.owner?.name ?? '';
                const ownerB = b.owner?.name ?? '';
                return factor * ownerA.localeCompare(ownerB, undefined, { sensitivity: 'base' });
            } else {
                return factor * (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' });
            }
        });
    });

    constructor(private ownersService: OwnersService,
                private dogsService: DogsService) {
    }

    ngOnInit() {
        this.ownersService.loadOwners();
        this.dogsService.loadDogs();
    }

    toggleSort(col: 'id' | 'name' | 'age' | 'owner') {
        if (this.sortColumn() === col) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(col);
            this.sortDirection.set('asc');
        }
    }

    addDog(name: string, age: number, ownerId: string) {
        this.clearResults();
        const trimmedName = name ? name.trim() : '';
        if (trimmedName.length === 0) {
            this.validationError.set("Dog's name cannot be empty!");
            return;
        }
        if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
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
            .addDog(trimmedName, age, ownerId)
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

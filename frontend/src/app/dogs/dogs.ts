import {Component, computed, OnInit, signal} from "@angular/core";
import {Dog} from "../graphql/types";
import {OwnersService} from "../service/owners.service";
import {DogsService} from "../service/dogs.service";
import {ApplicationsService} from "../service/applications.service";

@Component({
    selector: 'app-dogs',
    imports: [],
    template: `
        <div class="dogs-container">
            <div class="dog-action-container">
                <div class="dog-inputs">
                    <input #dogNameInput type="text" placeholder="Dog's name" maxlength="35" pattern="[a-zA-Z\\s]+" required>
                    <input #dogAgeInput type="number" placeholder="Age (years)" min="0" max="99">
                    <input #dogFeeInput type="number" placeholder="Adoption fee ($)" min="0" step="0.01">
                    <select #dogOwnerSelect>
                        <option value="">No Owner (Available for Adoption)</option>
                        @if (owners() && owners().length > 0) {
                            @for (owner of owners(); track owner.id) {
                                <option value="{{ owner.id }}">{{ owner.name }} (\${{ owner.money ?? 0 }})</option>
                            }
                        }
                    </select>

                    <button id="addDogButton" (click)="addDog(dogNameInput.value, Number(dogAgeInput.value), Number(dogFeeInput.value), dogOwnerSelect.value)">Add Dog</button>
                    <button class="clear-btn" (click)="clearAddDogMode(dogNameInput, dogAgeInput, dogFeeInput, dogOwnerSelect)">Clear</button>
                </div>

                <div class="result-message-container">
                    @if (validationError()) {
                        <span class="result-message validation-error">{{ validationError() }}</span>
                    } @else if (successMessage()) {
                        <span id="createdDogResult" class="result-message">{{ successMessage() }}</span>
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
                            <th class="sortable" (click)="toggleSort('fee')">
                                Fee {{ sortColumn() === 'fee' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                            </th>
                            <th class="sortable" (click)="toggleSort('status')">
                                Status {{ sortColumn() === 'status' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                            </th>
                            <th class="sortable" (click)="toggleSort('owner')">
                                Owner {{ sortColumn() === 'owner' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (dog of sortedDogs(); track dog.id) {
                            <tr>
                                <td>{{ dog.id }}</td>
                                <td>{{ dog.name }}</td>
                                <td>{{ dog.age }}</td>
                                <td>\${{ dog.fee }}</td>
                                <td>
                                    <span class="badge" [class]="'badge-' + dog.status.toLowerCase()">
                                        {{ dog.status }}
                                    </span>
                                </td>
                                <td>{{ dog.owner?.name ?? 'None' }}</td>
                                <td>
                                    @if (dog.status === 'AVAILABLE') {
                                        <button class="adopt-btn" (click)="openAdoptModal(dog)">Adopt</button>
                                    } @else if (dog.status === 'PENDING') {
                                        <span style="font-size: 12px; color: #b78103;">Under Review</span>
                                    } @else {
                                        <span>—</span>
                                    }
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>

            <!-- Adopt Modal Dialog -->
            @if (adoptingDog(); as targetDog) {
                <div class="modal-overlay" (click)="closeAdoptModal()">
                    <div class="modal-content" (click)="$event.stopPropagation()">
                        <h3>Adopt {{ targetDog.name }}</h3>
                        <p>Adoption Fee: <strong>\${{ targetDog.fee }}</strong></p>
                        
                        <label for="applicantSelect">Select Applicant:</label>
                        <select #applicantSelect id="applicantSelect">
                            <option value="" disabled selected>Choose owner</option>
                            @for (owner of owners(); track owner.id) {
                                <option value="{{ owner.id }}">
                                    {{ owner.name }} (Balance: \${{ owner.money ?? 0 }})
                                </option>
                            }
                        </select>

                        @if (adoptError()) {
                            <div class="result-message validation-error" style="font-size: 13px;">
                                {{ adoptError() }}
                            </div>
                        }

                        <div class="modal-actions">
                            <button class="clear-btn" (click)="closeAdoptModal()">Cancel</button>
                            <button class="adopt-btn" (click)="submitAdoption(applicantSelect.value)">Submit Application</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styleUrl: './dogs.css'
})

export class Dogs implements OnInit {
    owners = this.ownersService.owners;
    dogs = this.dogsService.dogs;
    loading = this.dogsService.loading;
    error = this.dogsService.error;
    successMessage = signal<string | null>(null);
    validationError = signal<string | null>(null);

    adoptingDog = signal<Dog | null>(null);
    adoptError = signal<string | null>(null);

    sortColumn = signal<'id' | 'name' | 'age' | 'fee' | 'status' | 'owner'>('id');
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
            } else if (col === 'fee') {
                return factor * (a.fee - b.fee);
            } else if (col === 'status') {
                return factor * (a.status ?? '').localeCompare(b.status ?? '');
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
                private dogsService: DogsService,
                private applicationsService: ApplicationsService) {
    }

    ngOnInit() {
        this.ownersService.loadOwners();
        this.dogsService.loadDogs();
    }

    toggleSort(col: 'id' | 'name' | 'age' | 'fee' | 'status' | 'owner') {
        if (this.sortColumn() === col) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(col);
            this.sortDirection.set('asc');
        }
    }

    addDog(name: string, age: number, fee: number, ownerId: string) {
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
        const actualFee = isNaN(fee) || fee < 0 ? 0 : fee;

        this.dogsService
            .addDog(trimmedName, age, ownerId ? ownerId : null, actualFee)
            .subscribe({
                next: ({data}: any) => {
                    const created = data?.createDog;
                    this.successMessage.set(`Added dog ${created?.name} (Age: ${created?.age}, Fee: $${created?.fee ?? 0})`);
                    this.dogsService.loadDogs();
                },
                error: (err: any) => {
                    this.validationError.set(err.message || 'Failed to add dog.');
                }
            });
    }

    clearAddDogMode(nameInput: HTMLInputElement, ageInput: HTMLInputElement, feeInput: HTMLInputElement, ownerSelect: HTMLSelectElement) {
        nameInput.value = '';
        ageInput.value = '';
        feeInput.value = '';
        ownerSelect.value = '';
        this.clearResults();
    }

    openAdoptModal(dog: Dog) {
        this.adoptingDog.set(dog);
        this.adoptError.set(null);
    }

    closeAdoptModal() {
        this.adoptingDog.set(null);
        this.adoptError.set(null);
    }

    submitAdoption(applicantId: string) {
        if (!applicantId) {
            this.adoptError.set('Please select an applicant!');
            return;
        }
        const targetDog = this.adoptingDog();
        if (!targetDog) return;

        this.applicationsService.createApplication(applicantId, String(targetDog.id)).subscribe({
            next: () => {
                this.closeAdoptModal();
                this.successMessage.set(`Adoption application submitted for ${targetDog.name}!`);
                this.dogsService.loadDogs();
            },
            error: (err: any) => {
                this.adoptError.set(err.message || 'Failed to submit application.');
            }
        });
    }

    clearResults() {
        this.successMessage.set(null);
        this.validationError.set(null);
    }

    protected readonly Number = Number;
}

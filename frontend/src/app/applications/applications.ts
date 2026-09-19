import {Component, computed, OnInit, signal} from '@angular/core';
import {ApplicationsService} from '../service/applications.service';
import {ApplicationStatus} from '../graphql/types';

@Component({
    selector: 'app-applications',
    imports: [],
    template: `
        <div class="applications-container">
            <div class="header-section">
                <h2>Adoption Applications</h2>
                <p>Review, approve, or reject incoming adoption requests.</p>
            </div>

            <div class="filters-bar">
                <button class="filter-btn" [class.active]="filter() === 'ALL'" (click)="setFilter('ALL')">All</button>
                <button class="filter-btn" [class.active]="filter() === 'PENDING'" (click)="setFilter('PENDING')">Pending</button>
                <button class="filter-btn" [class.active]="filter() === 'APPROVED'" (click)="setFilter('APPROVED')">Approved</button>
                <button class="filter-btn" [class.active]="filter() === 'REJECTED'" (click)="setFilter('REJECTED')">Rejected</button>
            </div>

            <div class="result-message-container">
                @if (errorMessage()) {
                    <span class="result-message error">{{ errorMessage() }}</span>
                } @else if (successMessage()) {
                    <span class="result-message">{{ successMessage() }}</span>
                }
            </div>

            @if (loading()) {
                <div class="status-message">Loading applications...</div>
            }

            @if (filteredApplications().length === 0 && !loading()) {
                <div class="empty-state">No applications found.</div>
            } @else if (!loading()) {
                <div class="table-container">
                    <table class="applications-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Dog</th>
                                <th>Adoption Fee</th>
                                <th>Applicant</th>
                                <th>Owner Funds</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (app of filteredApplications(); track app.id) {
                                <tr>
                                    <td>#{{ app.id }}</td>
                                    <td><strong>{{ app.dog.name }}</strong> (Age: {{ app.dog.age }})</td>
                                    <td>\${{ app.dog.fee }}</td>
                                    <td>{{ app.owner.name }}</td>
                                    <td>\${{ app.owner.money ?? 0 }}</td>
                                    <td>
                                        <span class="badge" [class]="'badge-' + app.status.toLowerCase()">
                                            {{ app.status }}
                                        </span>
                                    </td>
                                    <td>{{ formatTimestamp(app.createdAt) }}</td>
                                    <td>
                                        @if (app.status === 'PENDING') {
                                            <div class="actions-cell">
                                                <button class="approve-btn" (click)="approve(app.id)">Approve</button>
                                                <button class="reject-btn" (click)="reject(app.id)">Reject</button>
                                            </div>
                                        } @else {
                                            <span>—</span>
                                        }
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    `,
    styleUrl: './applications.css'
})
export class Applications implements OnInit {
    filter = signal<'ALL' | ApplicationStatus>('ALL');
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    loading = this.applicationsService.loading;
    applications = this.applicationsService.applications;

    filteredApplications = computed(() => {
        const currentFilter = this.filter();
        const all = this.applications();
        if (currentFilter === 'ALL') {
            return all;
        }
        return all.filter(a => a.status === currentFilter);
    });

    constructor(private applicationsService: ApplicationsService) {}

    ngOnInit() {
        this.applicationsService.loadApplications();
    }

    setFilter(filter: 'ALL' | ApplicationStatus) {
        this.filter.set(filter);
        this.clearMessages();
    }

    clearMessages() {
        this.successMessage.set(null);
        this.errorMessage.set(null);
    }

    approve(id: number) {
        this.clearMessages();
        this.applicationsService.approveApplication(String(id)).subscribe({
            next: () => {
                this.successMessage.set(`Application #${id} approved successfully!`);
                this.applicationsService.loadApplications();
            },
            error: (err: any) => {
                this.errorMessage.set(err.message || 'Failed to approve application.');
            }
        });
    }

    reject(id: number) {
        this.clearMessages();
        this.applicationsService.rejectApplication(String(id)).subscribe({
            next: () => {
                this.successMessage.set(`Application #${id} has been rejected.`);
                this.applicationsService.loadApplications();
            },
            error: (err: any) => {
                this.errorMessage.set(err.message || 'Failed to reject application.');
            }
        });
    }

    formatTimestamp(timestamp?: string): string {
        if (!timestamp) return '—';
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timestamp;
        }
    }
}

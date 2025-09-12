package com.ssafy.keeping.domain.menuCategory.model;

import com.ssafy.keeping.domain.store.model.Store;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "categories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"store_id","parent_id","category_name"}),
        indexes = {
                @Index(name="idx_cat_store_parent_order", columnList="store_id,parent_id,display_order")
        }
)
@EntityListeners(AuditingEntityListener.class)
public class MenuCategory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false,
            foreignKey = @ForeignKey(name="fk_category_store"))
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY) // 루트면 null
    @JoinColumn(name = "parent_id")
    MenuCategory parent;

    @Column(nullable = false, length = 100)
    private String categoryName;
    @Column(nullable = false)
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public void changeNameAndParent(String name, MenuCategory parent) {
        if (!Objects.equals(name, this.categoryName))
            this.categoryName = name;
        if (!Objects.equals(parent, this.parent))
            this.parent = parent;
    }

    public void changeOrder(int order) {
        if (!Objects.equals(order, this.displayOrder))
            this.displayOrder = order;
    }
}

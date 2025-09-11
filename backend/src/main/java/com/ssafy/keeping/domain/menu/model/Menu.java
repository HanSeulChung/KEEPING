package com.ssafy.keeping.domain.menu.model;

import com.ssafy.keeping.domain.menuCategory.model.MenuCategory;
import com.ssafy.keeping.domain.store.model.Store;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
        name = "menus",
        uniqueConstraints = {
                @UniqueConstraint(name="uq_store_menu_name", columnNames={"store_id","menu_name"}),
                @UniqueConstraint(name="uq_order_per_cat", columnNames={"store_id","category_id","display_order"})
        },
        indexes = {
                @Index(name="idx_store_isActive_order", columnList="store_id, is_active,display_order")
        }
)
@SQLDelete(sql = "update menus set deleted_at=now() where menu_id=?")
@Where(clause = "deleted_at is null")
@EntityListeners(AuditingEntityListener.class)
public class Menu {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false,
            foreignKey = @ForeignKey(name="fk_menu_store"))
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false,
            foreignKey = @ForeignKey(name="fk_menu_category"))
    private MenuCategory category;

    @Column(nullable = false, length = 100)
    private String menuName;
    @Column(nullable = false)
    @Min(1000)
    private int price;

    @Column(nullable = false)
    private String description;
    @Column(nullable = false, name="is_sold_out")
    @Builder.Default
    private boolean soldOut = false;
    @Column(nullable = false, name="is_active")
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false)
    private int displayOrder = 0;

    // TODO: 파일 서버 구축 후 수정 필요
    @Column
    private String imgUrl;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    public void editMenu(String menuName, String imgUrl,
                         int price, String description, int order) {
        if (!Objects.equals(menuName, this.menuName))
            this.menuName = menuName;
        if (!Objects.equals(imgUrl, this.imgUrl))
            this.imgUrl = imgUrl;
        if (!Objects.equals(price, this.price))
            this.price = price;
        if (!Objects.equals(description, this.description))
            this.description = description;
        if (!Objects.equals(order, this.displayOrder))
            this.displayOrder = order;
    }

    public void changeCategory(MenuCategory category) {
        if (category != null) this.category = category;
    }
}

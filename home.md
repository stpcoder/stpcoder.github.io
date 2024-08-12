---
layout: page
title: Home
---
<div class="posts">
  <h1>Recently posted</h1>
  <ul class="post-list">
    {% for post in site.posts %}
      <li>
        <h2>
          <a href="{{ post.url | relative_url }}">
            {{ post.title }}
          </a>
        </h2>
        <span class="post-date">{{ post.date | date_to_string }}</span>
        {% if post.description %}
          <p class="post-description">{{ post.description }}</p>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
</div>

<div class="pagination">
  {% if paginator.next_page %}
    <a class="pagination-item older" href="{{ paginator.next_page_path | relative_url }}">Older</a>
  {% else %}
    <span class="pagination-item older">Older</span>
  {% endif %}
  {% if paginator.previous_page %}
    <a class="pagination-item newer" href="{{ paginator.previous_page_path | relative_url }}">Newer</a>
  {% else %}
    <span class="pagination-item newer">Newer</span>
  {% endif %}
</div>